import mongoose from "mongoose";

const creditSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        entries: [
            {
                type: {
                    type: String,
                    enum: ["credit", "payment"],
                    required: true,
                },
                amount: { type: Number, required: true, min: 0 },
                note: { type: String, default: "" },
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        balance: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

creditSchema.index({ user: 1, owner: 1 }, { unique: true });
creditSchema.index({ owner: 1, balance: -1 });

export const Credit = mongoose.model("Credit", creditSchema);
