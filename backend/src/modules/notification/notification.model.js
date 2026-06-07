import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        title: String,
        message: String,
        link: {
            type: String,
            default: null,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        isread: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model(
    "Notification",
    notificationSchema
);