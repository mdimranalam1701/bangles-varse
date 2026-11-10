import express from "express";
import { z } from "zod";
import { addToCart, updateCart, getCart, removeFromCart, clearCart } from "./cart.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const addCartSchema = z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(50).optional().default(1),
    size: z.string().trim().max(20).optional().default("2.6"),
});

const updateCartSchema = z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(0).max(50),
    size: z.string().trim().max(20).optional(),
});

router.post("/", isAuth, validate(addCartSchema), addToCart);
router.patch("/", isAuth, validate(updateCartSchema), updateCart);
router.get("/", isAuth, getCart);
router.delete("/", isAuth, clearCart);
router.delete("/:productId", isAuth, removeFromCart);

export default router;
