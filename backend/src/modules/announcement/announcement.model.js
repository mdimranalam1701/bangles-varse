import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["info", "warning", "success", "error"],
            default: "info",
        },
        targetAudience: {
            type: String,
            enum: ["all", "users", "owners", "admins"],
            default: "all",
        },
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

export const Announcement = mongoose.model("Announcement", announcementSchema);
