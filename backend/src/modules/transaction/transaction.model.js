import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        amount: {
            type: Number,
            required: true,
        },

        type: {
            type: String,
            enum: ["credit", "payment"],
            required: true,
        },

        note: {
            type: String,
        },
    },
    { timestamps: true }
);


export const Transaction = mongoose.model("Transaction", transactionSchema);