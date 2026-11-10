import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        description: {
            type: String,
            default: "",
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: true,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: 0,
        },
        usageLimit: {
            type: Number,
            default: 0, // 0 = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        expiresAt: {
            type: Date,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
