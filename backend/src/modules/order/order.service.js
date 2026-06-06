import { getIO } from "../../utils/socket.js";
import { Product } from "../product/product.model.js";
import { Order } from "./order.model.js";
import { addCredit } from "../credit/credit.service.js";
import { CreditApproval } from "../credit/creditApproval.model.js";
import { Notification } from "../notification/notification.model.js";
import { clearCart } from "../cart/cart.service.js";

export const createOrder = async (data, userId) => {
    const { items, paymentType } = data;

    let totalAmount = 0;
    let ownerId = null;

    // calculate total
    for (let item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error("Product not found");
        }

        totalAmount += product.price * item.quantity;

        // store owner id
        ownerId = product.owner;
    }

    if (paymentType === "buy_on_credit") {
        const approval = await CreditApproval.findOne({ user: userId, owner: ownerId, status: "approved" });
        if (!approval) {
            throw new Error("You do not have credit approval from this shop owner.");
        }
    }

    const order = await Order.create({
        user: userId,
        items,
        totalAmount,
        paymentType,
    });

    // Clear cart upon successful order
    await clearCart(userId);

    const io = getIO();
    io?.emit("newOrder", {
        message: `New order received worth ₹${totalAmount} `
    });

    // Notify owner about new order
    if (ownerId) {
        await Notification.create({
            receiver: ownerId,
            title: "New Order Received! 🛒",
            message: `You have a new order worth ₹${totalAmount}. Check your dashboard for details.`,
            isread: false,
        });
    }

    // add credit for buy_on_credit
    if (paymentType === "buy_on_credit") {
        await addCredit(userId, ownerId, totalAmount);
    }

    return order;
};

export const getUserOrders = async (userId) => {
    return await Order.find({ user: userId })
        .populate("items.product", "name price image")
        .sort({ createdAt: -1 });
};

export const getOwnerOrders = async (ownerId) => {
    // Find all products belonging to this owner
    const products = await Product.find({ owner: ownerId }).select("_id");
    const productIds = products.map(p => p._id);

    // Find orders containing these products
    return await Order.find({ "items.product": { $in: productIds } })
        .populate("user", "name email")
        .populate("items.product", "name price image")
        .sort({ createdAt: -1 });
};

export const getAllOrders = async () => {
    return await Order.find()
        .populate("user", "name email")
        .populate("items.product", "name price")
        .sort({ createdAt: -1 });
};

export const getOrderById = async (orderId, userId, role) => {
    const order = await Order.findById(orderId)
        .populate("user", "name email profilePicture")
        .populate("items.product", "name price image category owner");

    if (!order) {
        throw new Error("Order not found");
    }

    // Access control
    if (role === "user" && order.user._id.toString() !== userId.toString()) {
        throw new Error("Not authorized to view this order");
    }

    if (role === "owner") {
        // Check if any product in the order belongs to this owner
        const hasOwnerProduct = order.items.some(
            item => item.product?.owner?.toString() === userId.toString()
        );
        if (!hasOwnerProduct) {
            throw new Error("Not authorized to view this order");
        }
    }

    return order;
};

export const updateOrderStatus = async (orderId, status, note = "", userId = null) => {
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) throw new Error("Order not found");

    const validTransitions = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["processing", "cancelled"],
        processing: ["shipped", "cancelled"],
        shipped: ["out_for_delivery", "returned"],
        out_for_delivery: ["delivered", "returned"],
        delivered: ["returned"],
        cancelled: [],
        returned: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
        throw new Error(`Cannot change status from ${order.status} to ${status}`);
    }

    order.status = status;
    order.statusHistory.push({ status, date: new Date(), note });

    if (status === "delivered") {
        order.deliveredAt = new Date();
    }

    await order.save();

    const statusMessages = {
        confirmed: "Your order has been confirmed! ✅",
        processing: "Your order is being prepared 📦",
        shipped: "Your order has been shipped! 🚚",
        out_for_delivery: "Your order is out for delivery! 🛵",
        delivered: "Your order has been delivered! 🎉",
        cancelled: "Your order has been cancelled ❌",
    };

    if (statusMessages[status]) {
        await Notification.create({
            receiver: order.user._id,
            title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: statusMessages[status],
        });
    }

    return order;
};

export const requestReturn = async (orderId, userId, reason) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.user.toString() !== userId.toString()) throw new Error("Not authorized");
    if (!["delivered"].includes(order.status)) throw new Error("Can only return delivered orders");
    if (order.returnRequest.status !== "none") throw new Error("Return already requested");

    order.returnRequest = {
        status: "requested",
        reason,
        requestedAt: new Date(),
    };
    await order.save();

    const products = await Product.find({ _id: { $in: order.items.map(i => i.product) } });
    const ownerIds = [...new Set(products.map(p => p.owner?.toString()).filter(Boolean))];
    for (const ownerId of ownerIds) {
        await Notification.create({
            receiver: ownerId,
            title: "Return Request 📋",
            message: `A customer has requested a return for order #${orderId.toString().slice(-8).toUpperCase()}. Reason: ${reason}`,
        });
    }

    return order;
};

export const handleReturnRequest = async (orderId, action, adminId) => {
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) throw new Error("Order not found");
    if (order.returnRequest.status !== "requested") throw new Error("No pending return request");

    order.returnRequest.status = action;
    order.returnRequest.resolvedAt = new Date();

    if (action === "approved") {
        order.status = "returned";
        order.statusHistory.push({ status: "returned", date: new Date(), note: "Return approved" });
    }

    await order.save();

    await Notification.create({
        receiver: order.user._id,
        title: `Return ${action === "approved" ? "Approved ✅" : "Rejected ❌"}`,
        message: action === "approved"
            ? "Your return request has been approved. Refund will be processed shortly."
            : "Your return request has been rejected. Please contact support.",
    });

    return order;
};

export const updateTracking = async (orderId, trackingNumber, trackingUrl) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    await order.save();

    await Notification.create({
        receiver: order.user,
        title: "Tracking Info Updated 📦",
        message: `Tracking number: ${trackingNumber}`,
    });

    return order;
};

export const reorder = async (orderId, userId) => {
    const originalOrder = await Order.findById(orderId);
    if (!originalOrder) throw new Error("Order not found");
    if (originalOrder.user.toString() !== userId.toString()) throw new Error("Not authorized");

    const { clearCart, addToCart } = await import("../cart/cart.service.js");
    await clearCart(userId);

    for (const item of originalOrder.items) {
        const product = await Product.findById(item.product);
        if (product && product.stock > 0) {
            await addToCart(userId, item.product, item.quantity);
        }
    }

    return { message: "Items added to cart" };
};