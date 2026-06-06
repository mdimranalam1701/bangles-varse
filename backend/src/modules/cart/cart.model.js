import mongoose from "mongoose";
import { Product } from "../product/product.model.js";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            unique: true,
        },

        items: [
            {
                Product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },

                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);