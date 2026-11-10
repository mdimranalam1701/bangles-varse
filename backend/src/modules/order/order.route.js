import express from "express";
import { z } from "zod";
import {
    createOrder,
    createQuickOrder,
    trackOrders,
    getMyOrders,
    getOwnerOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
} from "./order.controller.js";
import { isAuth, optionalAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const orderItemSchema = z.object({
    product: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(100),
    size: z.string().trim().max(20).optional(),
});

const addressSchema = z.object({
    line1: z.string().trim().max(250).optional().default(""),
    landmark: z.string().trim().max(150).optional().default(""),
    city: z.string().trim().max(100).optional().default(""),
    pincode: z.string().trim().max(12).optional().default(""),
});

const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    paymentType: z.enum(["cash", "online", "credit"]).optional().default("cash"),
    customerName: z.string().trim().max(100).optional(),
    customerPhone: z.string().trim().max(20).optional(),
    shippingAddress: addressSchema.optional(),
    notes: z.string().trim().max(400).optional(),
    source: z.enum(["cart", "quick_order", "whatsapp"]).optional(),
    idempotencyKey: z.string().trim().max(120).optional(),
});

const quickOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    paymentType: z.enum(["cash", "online", "credit"]).optional().default("cash"),
    customerName: z.string().trim().min(2, "Please enter your name").max(100),
    customerPhone: z.string().trim().min(10, "Enter 10-digit mobile number").max(15),
    shippingAddress: z.object({
        line1: z.string().trim().min(3, "Please enter delivery address or village").max(250),
        landmark: z.string().trim().max(150).optional().default(""),
        city: z.string().trim().max(100).optional().default(""),
        pincode: z.string().trim().max(12).optional().default(""),
    }),
    notes: z.string().trim().max(400).optional(),
    idempotencyKey: z.string().trim().max(120).optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(["pending", "confirmed", "packed", "shipped", "paid", "delivered", "cancelled"]),
    note: z.string().trim().max(250).optional(),
});

router.post("/quick", optionalAuth, validate(quickOrderSchema), createQuickOrder);
router.get("/track", trackOrders);

router.post("/", isAuth, validate(createOrderSchema), createOrder);
router.get("/my", isAuth, getMyOrders);
router.get("/owner", isAuth, authorizeRoles("owner", "admin"), getOwnerOrders);
router.get("/", isAuth, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status", isAuth, authorizeRoles("owner", "admin"), validate(updateStatusSchema), updateOrderStatus);
router.patch("/:id/cancel", isAuth, cancelOrder);

export default router;
