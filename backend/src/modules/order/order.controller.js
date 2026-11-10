import * as orderService from "./order.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const createOrder = asyncHandler(async (req, res) => {
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;
    const order = await orderService.createOrder(
        { ...req.body, idempotencyKey },
        req.user
    );
    res.status(201).json({ success: true, data: order });
});

export const createQuickOrder = asyncHandler(async (req, res) => {
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;
    const order = await orderService.createQuickOrder(
        { ...req.body, idempotencyKey },
        req.user || null
    );
    res.status(201).json({ success: true, data: order });
});

export const trackOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.trackOrders({
        phone: req.query.phone,
        code: req.query.code,
    });
    res.json({ success: true, data: orders });
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.user._id);
    res.json({ success: true, data: orders });
});

export const getOwnerOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getOwnerOrders(req.user._id);
    res.json({ success: true, data: orders });
});

export const getAllOrders = asyncHandler(async (_req, res) => {
    const orders = await orderService.getAllOrders();
    res.json({ success: true, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status,
        req.body.note,
        req.user
    );
    res.json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelUserOrder(req.params.id, req.user._id);
    res.json({ success: true, data: order });
});
