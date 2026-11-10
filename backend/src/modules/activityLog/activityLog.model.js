import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        action: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            default: "",
        },
        targetType: {
            type: String,
            enum: ["user", "product", "order", "coupon", "announcement", "system"],
            default: "system",
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        ipAddress: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
