import * as paymentService from "./payment.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const createPayment = asyncHandler(async (req, res) => {
    const order = await paymentService.createPaymentOrder({
        amount: req.body.amount,
        orderId: req.body.orderId,
    });
    res.json({ success: true, data: order });
});

export const verifyPayment = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyPayment(req.body);
    res.status(result.verified ? 200 : 400).json({
        success: result.verified,
        message: result.message,
        data: result.order,
    });
});
