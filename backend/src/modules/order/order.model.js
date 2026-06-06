import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],

    totalAmount: Number,
    paymentType: {
      type: String,
      enum: ["cash", "credit", "buy_on_credit"],
      default: "cash",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "delivered"],
      default: "pending",
    },
    paymentId: {
      type: String,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);