import express from "express";

import {
  addToCart,
  getCart,
  removeFromCart,
} from "./cart.controller.js";

import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// add item
router.post("/", isAuth, addToCart);

// get cart
router.get("/", isAuth, getCart);

// remove item
router.delete(
  "/:productId",
  isAuth,
  removeFromCart
);

export default router;