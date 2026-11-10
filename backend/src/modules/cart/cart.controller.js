import * as cartService from "./cart.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, size } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, quantity, size);
    res.json({ success: true, data: cart });
});

export const updateCart = asyncHandler(async (req, res) => {
    const { productId, quantity, size } = req.body;
    const cart = await cartService.updateCartQuantity(req.user._id, productId, quantity, size);
    res.json({ success: true, data: cart });
});

export const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    res.json({ success: true, data: cart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await cartService.removeFromCart(
        req.user._id,
        req.params.productId,
        req.query.size
    );
    res.json({ success: true, data: cart });
});

export const clearCart = asyncHandler(async (req, res) => {
    const cart = await cartService.clearCart(req.user._id);
    res.json({ success: true, data: cart });
});
