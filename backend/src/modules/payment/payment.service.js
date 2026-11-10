import crypto from "crypto";
import getRazorpay, { isRazorpayConfigured } from "../../config/razorpay.js";
import { Order } from "../order/order.model.js";
import { createTransaction } from "../transaction/transaction.service.js";
import { AppError } from "../../utils/errors.js";

export const createPaymentOrder = async ({ amount, orderId }) => {
    if (!isRazorpayConfigured()) {
        throw new AppError(
            "Online payment gateway is not configured on this server. Please use Cash on Delivery.",
            503,
            "PAYMENT_GATEWAY_UNAVAILABLE"
        );
    }

    let finalAmount = Number(amount);
    if (orderId) {
        const order = await Order.findById(orderId).select("totalAmount isPaid").lean();
        if (!order) {
            throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
        }
        if (order.isPaid) {
            throw new AppError("Order is already paid", 409, "ALREADY_PAID");
        }
        finalAmount = order.totalAmount;
    }

    if (!finalAmount || finalAmount <= 0) {
        throw new AppError("Invalid payment amount", 400, "INVALID_AMOUNT");
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `bv_${orderId || Date.now()}`,
    });

    return {
        ...order,
        keyId: process.env.RAZORPAY_KEY_ID,
    };
};

export const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
}) => {
    if (!isRazorpayConfigured()) {
        throw new AppError("Payment gateway not configured", 503, "PAYMENT_GATEWAY_UNAVAILABLE");
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return {
            verified: false,
            message: "Invalid payment signature",
        };
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    if (!order.isPaid) {
        order.isPaid = true;
        order.status = "paid";
        order.paymentId = razorpay_payment_id;
        order.paidAt = new Date();
        order.statusHistory.push({
            status: "paid",
            note: `Paid online via Razorpay (${razorpay_payment_id})`,
            updatedAt: new Date(),
        });
        await order.save();

        await createTransaction({
            user: order.user,
            owner: order.owners?.[0] || null,
            amount: order.totalAmount,
            type: "payment",
            note: `Online payment for ${order.orderCode || order._id}`,
        });
    }

    return {
        verified: true,
        message: "Payment verified successfully",
        order,
    };
};
