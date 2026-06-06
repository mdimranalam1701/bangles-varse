import express from "express";

import { createPayment, verifyPayment } from "./payment.controller.js";

import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/create-order",
    isAuth,
    createPayment
);

router.post(
    "/verify",
    isAuth,
    verifyPayment
);

export default router;