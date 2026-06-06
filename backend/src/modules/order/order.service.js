import { io } from "../../server.js";
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

    io.emit("newOrder", {
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