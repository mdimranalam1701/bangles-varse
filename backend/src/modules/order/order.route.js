import express from "express";
import {
  createOrder,
  getMyOrders,
  getOwnerOrders,
  getAllOrders,
  getOrder,
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

// get specific order
router.get("/:id", isAuth, getOrder);

export default router;