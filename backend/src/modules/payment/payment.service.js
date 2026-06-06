import crypto from "crypto";

import razorpay from "../../config/razorpay.js";
import { Order } from "../order/order.model.js";
import { createTransaction } from "../transaction/transaction.service.js";
export const createPaymentOrder = async (
    amount
) => {

    const options = {
        amount: amount * 100, // paisa
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order =
        await razorpay.orders.create(options);

    return order;
};


export const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
}) => {

    const body =
        razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(body.toString())
        .digest("hex");

    // invalid payment
    if (expectedSignature !== razorpay_signature) {

        return {
            verified: false,
            message: "Invalid payment",
        };
    }

    // find order
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error("Order not found");
    }

    // mark paid
    order.isPaid = true;
    order.status = "paid";
    order.paymentId = razorpay_payment_id;
    order.paidAt = new Date();

    await order.save();

    // create transaction
    await createTransaction({
        user: order.user,
        owner: null,
        amount: order.totalAmount,
        type: "payment",
        note: "Online payment via Razorpay",
    });

    return {
        verified: true,
        message: "Payment verified successfully",
        order,
    };
};