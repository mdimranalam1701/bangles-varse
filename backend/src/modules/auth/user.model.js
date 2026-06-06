import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
}, { _id: true });

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

    // Address Book
    addresses: [addressSchema],

    // Recently Viewed Products
    recentlyViewed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],

    // Referral System
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    referralCount: {
        type: Number,
        default: 0,
    },

    // Shop Customization (for owners)
    shopBanner: {
        type: String,
        default: "",
    },
    shopDescription: {
        type: String,
        default: "",
    },
    shopTheme: {
        type: String,
        default: "gold",
    },

    // 2FA
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        default: "",
    },

    // OTP
    otp: {
        type: String,
        default: "",
    },
    otpExpiry: {
        type: Date,
    },

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);