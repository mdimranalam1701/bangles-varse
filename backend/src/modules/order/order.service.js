import crypto from "crypto";
import mongoose from "mongoose";
import { emitToRoom } from "../../config/socket.js";
import { Product } from "../product/product.model.js";
import { Cart } from "../cart/cart.model.js";
import { User } from "../auth/user.model.js";
import { Order } from "./order.model.js";
import { addCredit } from "../credit/credit.service.js";
import { Notification } from "../notification/notification.model.js";
import { AppError, normalizePhone } from "../../utils/errors.js";

const generateOrderCode = () => {
    const num = crypto.randomInt(1000, 9999);
    const alpha = crypto.randomBytes(1).toString("hex").toUpperCase();
    return `BV-${num}${alpha}`;
};

const rollbackStock = async (reservedItems) => {
    for (const r of reservedItems) {
        await Product.findByIdAndUpdate(r.product, { $inc: { stock: r.quantity } });
    }
};

const buildAndCreateOrder = async ({
    items,
    paymentType = "cash",
    userId,
    customerName,
    customerPhone,
    shippingAddress,
    notes,
    source = "cart",
    idempotencyKey,
    clearUserCart = false,
}) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Please select at least one bangle to order", 400, "EMPTY_ITEMS");
    }

    if (idempotencyKey) {
        const existing = await Order.findOne({ idempotencyKey })
            .populate("items.product", "name nameHi price image")
            .lean();
        if (existing) {
            return existing;
        }
    }

    const reservedItems = [];
    const enrichedItems = [];
    const ownerTotals = new Map();
    let totalAmount = 0;

    try {
        for (const rawItem of items) {
            const productId = rawItem.product;
            const qty = Math.max(1, Number(rawItem.quantity) || 1);

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new AppError("Invalid product in order", 400, "INVALID_PRODUCT");
            }

            // Atomically reserve stock so concurrent buyers cannot oversell
            const product = await Product.findOneAndUpdate(
                { _id: productId, isActive: { $ne: false }, stock: { $gte: qty } },
                { $inc: { stock: -qty } },
                { new: true }
            );

            if (!product) {
                const existingProd = await Product.findById(productId).select("name stock").lean();
                if (!existingProd) {
                    throw new AppError("One of the selected bangles is no longer available", 404, "PRODUCT_NOT_FOUND");
                }
                throw new AppError(
                    `${existingProd.name} has only ${existingProd.stock} left in stock`,
                    409,
                    "INSUFFICIENT_STOCK"
                );
            }

            reservedItems.push({ product: product._id, quantity: qty });

            const lineTotal = product.price * qty;
            totalAmount += lineTotal;

            const ownerKey = product.owner ? product.owner.toString() : null;
            if (ownerKey) {
                ownerTotals.set(ownerKey, (ownerTotals.get(ownerKey) || 0) + lineTotal);
            }

            enrichedItems.push({
                product: product._id,
                owner: product.owner,
                name: product.name,
                image: product.image || product.images?.[0] || "",
                price: product.price,
                size: rawItem.size || product.sizes?.[0] || "2.6",
                quantity: qty,
            });
        }

        const owners = Array.from(ownerTotals.keys());
        const orderCode = generateOrderCode();

        const order = await Order.create({
            orderCode,
            user: userId || undefined,
            customerName: customerName?.trim() || "",
            customerPhone: customerPhone || "",
            shippingAddress: {
                line1: shippingAddress?.line1?.trim() || "",
                landmark: shippingAddress?.landmark?.trim() || "",
                city: shippingAddress?.city?.trim() || "",
                pincode: shippingAddress?.pincode?.trim() || "",
            },
            notes: notes?.trim() || "",
            items: enrichedItems,
            owners,
            totalAmount,
            paymentType,
            status: "pending",
            statusHistory: [
                {
                    status: "pending",
                    note:
                        paymentType === "cash"
                            ? "Order received (Cash on Delivery)"
                            : paymentType === "credit"
                                ? "Order placed on Shop Khata (Credit)"
                                : "Order created, awaiting online payment",
                    updatedAt: new Date(),
                },
            ],
            source,
            ...(idempotencyKey ? { idempotencyKey } : {}),
        });

        // Clear user's cart after cart checkout
        if (clearUserCart && userId) {
            await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        }

        // Notify every involved shop owner + record per-owner Khata ONLY for "credit" paymentType
        for (const [ownerId, ownerSubtotal] of ownerTotals.entries()) {
            const notif = await Notification.create({
                receiver: ownerId,
                title: `New Order ${orderCode}`,
                message: `${customerName || "Customer"} placed an order worth Rs.${ownerSubtotal.toLocaleString("en-IN")} (${paymentType.toUpperCase()}).`,
                type: "order",
                link: "/owner/dashboard",
                isread: false,
            });

            emitToRoom(`owner:${ownerId}`, "newOrder", {
                orderId: order._id,
                orderCode,
                amount: ownerSubtotal,
                paymentType,
                customerName: customerName || "Customer",
                notification: notif,
            });

            if (paymentType === "credit" && userId) {
                await addCredit(userId, ownerId, ownerSubtotal, `Khata order ${orderCode}`, order._id);
            }
        }

        return order;
    } catch (err) {
        await rollbackStock(reservedItems);
        throw err;
    }
};

export const createOrder = async (data, user) => {
    const phone = normalizePhone(data.customerPhone || user.phone || "");
    const addressLine = data.shippingAddress?.line1 || user.address || "";

    return await buildAndCreateOrder({
        items: data.items,
        paymentType: data.paymentType || "cash",
        userId: user._id,
        customerName: data.customerName || user.name,
        customerPhone: phone,
        shippingAddress: {
            line1: addressLine,
            landmark: data.shippingAddress?.landmark || "",
            city: data.shippingAddress?.city || user.city || "",
            pincode: data.shippingAddress?.pincode || user.pincode || "",
        },
        notes: data.notes,
        source: data.source || "cart",
        idempotencyKey: data.idempotencyKey,
        clearUserCart: data.source !== "quick_order",
    });
};

export const createQuickOrder = async (data, maybeUser = null) => {
    const cleanPhone = normalizePhone(data.customerPhone);
    if (cleanPhone.length !== 10) {
        throw new AppError("Please enter a valid 10-digit mobile number", 400, "INVALID_PHONE");
    }

    let linkedUserId = maybeUser?._id || null;

    if (!linkedUserId) {
        let customer = await User.findOne({ phone: cleanPhone }).select("_id role name address city");
        if (!customer) {
            customer = await User.create({
                name: data.customerName.trim(),
                phone: cleanPhone,
                whatsappNumber: cleanPhone,
                address: data.shippingAddress?.line1?.trim() || "",
                city: data.shippingAddress?.city?.trim() || "",
                pincode: data.shippingAddress?.pincode?.trim() || "",
                role: "user",
                isQuickAccount: true,
            });
        }
        linkedUserId = customer._id;
    }

    return await buildAndCreateOrder({
        items: data.items,
        paymentType: data.paymentType || "cash",
        userId: linkedUserId,
        customerName: data.customerName,
        customerPhone: cleanPhone,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        source: "quick_order",
        idempotencyKey: data.idempotencyKey,
        clearUserCart: false,
    });
};

export const trackOrders = async ({ phone, code }) => {
    const cleanCode = code?.trim().toUpperCase();
    const cleanPhone = phone ? normalizePhone(phone) : "";

    if (!cleanCode && cleanPhone.length !== 10) {
        throw new AppError(
            "Enter your 10-digit mobile number or Order Code (e.g. BV-1234)",
            400,
            "MISSING_TRACKING_PARAM"
        );
    }

    const filter = {};
    if (cleanCode && cleanPhone.length === 10) {
        filter.orderCode = cleanCode;
        filter.customerPhone = cleanPhone;
    } else if (cleanCode) {
        filter.orderCode = cleanCode;
    } else {
        filter.customerPhone = cleanPhone;
    }

    const orders = await Order.find(filter)
        .select("orderCode customerName customerPhone shippingAddress.city items totalAmount paymentType status statusHistory isPaid createdAt")
        .populate("items.product", "name nameHi image category")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean();

    // Mask customer phone for public tracking responses
    return orders.map((o) => ({
        ...o,
        customerPhoneMasked: o.customerPhone
            ? `******${o.customerPhone.slice(-4)}`
            : "",
        customerPhone: undefined,
    }));
};

export const getUserOrders = async (userId) => {
    return await Order.find({ user: userId })
        .populate("items.product", "name nameHi price image category")
        .sort({ createdAt: -1 })
        .lean();
};

export const getOwnerOrders = async (ownerId) => {
    const products = await Product.find({ owner: ownerId }).select("_id").lean();
    const productIds = products.map((p) => p._id);

    return await Order.find({
        $or: [{ owners: ownerId }, { "items.product": { $in: productIds } }],
    })
        .populate("user", "name email phone address city")
        .populate("items.product", "name nameHi price image owner")
        .sort({ createdAt: -1 })
        .lean();
};

export const getAllOrders = async () => {
    return await Order.find()
        .populate("user", "name email phone")
        .populate("items.product", "name price image")
        .sort({ createdAt: -1 })
        .lean();
};

export const updateOrderStatus = async (orderId, nextStatus, note, actor) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (actor.role === "owner") {
        const ownsOrder =
            order.owners?.some((id) => id.toString() === actor._id.toString()) ||
            order.items?.some((item) => item.owner?.toString() === actor._id.toString());
        if (!ownsOrder) {
            throw new AppError("Not authorized to update this order", 403, "FORBIDDEN");
        }
    }

    if (order.status === "cancelled" && nextStatus !== "cancelled") {
        throw new AppError("Cancelled orders cannot be reopened", 400, "INVALID_TRANSITION");
    }

    // Restore stock when transitioning to cancelled
    if (nextStatus === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
    }

    if (nextStatus === "paid") {
        order.isPaid = true;
        order.paidAt = new Date();
    }

    order.status = nextStatus;
    order.statusHistory.push({
        status: nextStatus,
        note: note?.trim() || `Order marked as ${nextStatus}`,
        updatedAt: new Date(),
    });

    await order.save();

    if (order.user) {
        const notif = await Notification.create({
            receiver: order.user,
            title: `Order ${order.orderCode || ""} ${nextStatus}`,
            message: `Your bangle order is now ${nextStatus}.`,
            type: "order",
            link: "/my-orders",
            isread: false,
        });
        emitToRoom(`user:${order.user.toString()}`, "orderUpdated", {
            orderId: order._id,
            orderCode: order.orderCode,
            status: nextStatus,
            notification: notif,
        });
    }

    return order;
};

export const cancelUserOrder = async (orderId, userId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (order.user?.toString() !== userId.toString()) {
        throw new AppError("Not authorized to cancel this order", 403, "FORBIDDEN");
    }

    if (!["pending", "confirmed"].includes(order.status)) {
        throw new AppError("Packed or shipped orders cannot be cancelled", 400, "CANNOT_CANCEL");
    }

    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.status = "cancelled";
    order.statusHistory.push({
        status: "cancelled",
        note: "Cancelled by customer",
        updatedAt: new Date(),
    });
    await order.save();

    return order;
};
