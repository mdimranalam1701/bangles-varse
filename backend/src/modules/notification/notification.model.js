import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: String,
        message: String,
        type: {
            type: String,
            enum: ["order", "approval", "credit", "system"],
            default: "system",
        },
        link: {
            type: String,
            default: "",
        },
        isread: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
