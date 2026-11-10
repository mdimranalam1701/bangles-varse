import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "💎",
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        productCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
