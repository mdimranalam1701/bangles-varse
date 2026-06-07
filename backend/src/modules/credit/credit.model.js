import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        entries: [
            {
                type: {
                    type: String,
                    enum: ["credit", "payment"],
                },
                amount: Number,
                description: {
                    type: String,
                    default: "",
                },
                orderId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Order",
                    default: null,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                paymentMethod: {
                    type: String,
                    enum: ["upi", "cash", null],
                    default: null,
                },
                status: {
                    type: String,
                    enum: ["pending", "paid"],
                    default: "pending",
                }
            },
        ],
        balance: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Credit = mongoose.model("Credit", creditSchema);