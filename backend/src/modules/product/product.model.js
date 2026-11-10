import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        nameHi: {
            type: String,
            default: "",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        compareAtPrice: {
            type: Number,
            min: 0,
        },
        category: {
            type: String,
            default: "Gold",
            trim: true,
        },
        material: {
            type: String,
            default: "22K Gold Plated",
            trim: true,
        },
        occasion: {
            type: String,
            default: "Festive",
            trim: true,
        },
        sizes: {
            type: [String],
            default: ["2.4", "2.6", "2.8"],
        },
        setCount: {
            type: Number,
            default: 2,
            min: 1,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        image: {
            type: String,
            default: "",
        },
        images: {
            type: [String],
            default: [],
        },
        sku: {
            type: String,
            default: "",
            trim: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ owner: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: -1, averageRating: -1 });
productSchema.index({ name: "text", nameHi: "text", description: "text", category: "text", material: "text" });

export const Product = mongoose.model("Product", productSchema);
