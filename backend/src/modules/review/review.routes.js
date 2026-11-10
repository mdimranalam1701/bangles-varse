import express from "express";
import { z } from "zod";
import { addReview, getReviews } from "./review.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional().default(""),
});

router.post("/:productId", isAuth, validate(reviewSchema), addReview);
router.get("/:productId", getReviews);

export default router;
