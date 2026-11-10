import express from "express";
import { z } from "zod";
import { createPayment, verifyPayment } from "./payment.controller.js";
import { optionalAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const createPaymentSchema = z.object({
    amount: z.coerce.number().positive().optional(),
    orderId: z.string().optional(),
});

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    orderId: z.string().min(1),
});

router.post("/create-order", optionalAuth, validate(createPaymentSchema), createPayment);
router.post("/verify", optionalAuth, validate(verifyPaymentSchema), verifyPayment);

export default router;
