import mongoose from "mongoose";

const creditApprovalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        blocked: {
            type: Boolean,
            default: false,
        },
        blockedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// A user should only have one approval request per owner at a time
creditApprovalSchema.index({ user: 1, owner: 1 }, { unique: true });

export const CreditApproval = mongoose.model("CreditApproval", creditApprovalSchema);
