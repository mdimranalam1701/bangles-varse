import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderCode: {
            type: String,
            unique: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        customerName: {
            type: String,
            trim: true,
            default: "",
        },
        customerPhone: {
            type: String,
            trim: true,
            index: true,
            default: "",
        },
        shippingAddress: {
            line1: { type: String, trim: true, default: "" },
            landmark: { type: String, trim: true, default: "" },
            city: { type: String, trim: true, default: "" },
            pincode: { type: String, trim: true, default: "" },
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                owner: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                name: { type: String, default: "" },
                image: { type: String, default: "" },
                price: { type: Number, default: 0 },
                size: { type: String, default: "2.6" },
                quantity: { type: Number, required: true, min: 1 },
            },
        ],
        owners: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        couponCode: {
            type: String,
            default: "",
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentType: {
            type: String,
            enum: ["cash", "online", "credit"],
            default: "cash",
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "packed", "shipped", "paid", "delivered", "cancelled"],
            default: "pending",
        },
        statusHistory: [
            {
                status: { type: String },
                note: { type: String, default: "" },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
        source: {
            type: String,
            enum: ["cart", "quick_order", "whatsapp"],
            default: "cart",
        },
        idempotencyKey: {
            type: String,
            unique: true,
            sparse: true,
        },
        paymentId: {
            type: String,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ owners: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
