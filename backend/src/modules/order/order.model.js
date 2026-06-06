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
        price: Number,
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
      enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "pending",
    },

    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
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

    deliveredAt: {
      type: Date,
    },

    // Coupon
    couponCode: {
      type: String,
      default: "",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },

    // Tracking
    trackingNumber: {
      type: String,
      default: "",
    },
    trackingUrl: {
      type: String,
      default: "",
    },

    // Return/Refund
    returnRequest: {
      status: {
        type: String,
        enum: ["none", "requested", "approved", "rejected", "returned"],
        default: "none",
      },
      reason: String,
      requestedAt: Date,
      resolvedAt: Date,
    },

    // Notes
    customerNote: {
      type: String,
      default: "",
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);