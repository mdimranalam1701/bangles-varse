import express from "express";
import {
  createOrder,
  getMyOrders,
  getOwnerOrders,
  getAllOrders,
  getOrder,
  updateStatus,
  requestReturn,
  handleReturn,
  updateTracking,
  reorder,
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

// update order status (owner/admin)
router.put("/:id/status", isAuth, authorizeRoles("owner", "admin"), updateStatus);

// update tracking info (owner)
router.put("/:id/tracking", isAuth, authorizeRoles("owner", "admin"), updateTracking);

// return request (customer)
router.post("/:id/return", isAuth, requestReturn);

// handle return request (owner/admin)
router.put("/:id/return", isAuth, authorizeRoles("owner", "admin"), handleReturn);

// reorder (customer)
router.post("/:id/reorder", isAuth, reorder);

export default router;