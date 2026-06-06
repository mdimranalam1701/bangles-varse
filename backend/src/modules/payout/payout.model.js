import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["upi", "bank_transfer", "cash"],
            default: "upi",
        },
        transactionId: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
        },
        processedAt: {
            type: Date,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Payout = mongoose.model("Payout", payoutSchema);
