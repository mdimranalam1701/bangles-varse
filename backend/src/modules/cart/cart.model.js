import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
            required: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                size: {
                    type: String,
                    default: "2.6",
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
