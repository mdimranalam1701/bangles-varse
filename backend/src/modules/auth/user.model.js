import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "owner", "admin"],
        default: "user",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    companyName: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    upiId: {
        type: String,
        default: "",
    },
    isApproved: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);