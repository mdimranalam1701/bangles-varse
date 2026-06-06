import express from "express";
import {
  createOrder,
  getMyOrders,
  getOwnerOrders,
  getAllOrders,
} from "./order.controller.js";

import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// user places order
router.post("/", isAuth, createOrder);

// user orders
router.get("/my", isAuth, getMyOrders);

// owner orders (orders containing their products)
router.get("/owner", isAuth, authorizeRoles("owner"), getOwnerOrders);

// admin only
router.get("/", isAuth, authorizeRoles("admin"), getAllOrders);

export default router;