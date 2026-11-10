import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        label: { type: String, default: "Home", trim: true },
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, default: "", trim: true },
        pincode: { type: String, default: "", trim: true },
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
    },
    { _id: true }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: "",
            trim: true,
        },
        password: {
            type: String,
            select: false,
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
        bio: {
            type: String,
            default: "",
            trim: true,
        },
        companyName: {
            type: String,
            default: "",
            trim: true,
        },
        address: {
            type: String,
            default: "",
            trim: true,
        },
        city: {
            type: String,
            default: "",
            trim: true,
        },
        pincode: {
            type: String,
            default: "",
            trim: true,
        },
        upiId: {
            type: String,
            default: "",
            trim: true,
        },
        addresses: [addressSchema],
        recentlyViewed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        shopBanner: { type: String, default: "" },
        shopDescription: { type: String, default: "" },
        preferredLanguage: {
            type: String,
            enum: ["en", "hi"],
            default: "en",
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isQuickAccount: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.index({ role: 1, isApproved: 1 });

export const User = mongoose.model("User", userSchema);
