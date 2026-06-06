import express from "express";

import {
  addReview,
  getReviews,
} from "./review.controller.js";

import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// add review
router.post(
  "/:productId",
  isAuth,
  addReview
);

// get reviews
router.get(
  "/:productId",
  getReviews
);

export default router;