import express from "express";
import {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCoupon,
} from "./coupon.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Admin only
router.post("/", isAuth, authorizeRoles("admin"), createCoupon);
router.get("/", isAuth, authorizeRoles("admin"), getAllCoupons);
router.put("/:id", isAuth, authorizeRoles("admin"), updateCoupon);
router.delete("/:id", isAuth, authorizeRoles("admin"), deleteCoupon);
router.put("/:id/toggle", isAuth, authorizeRoles("admin"), toggleCoupon);

// Any authenticated user
router.post("/validate", isAuth, validateCoupon);

export default router;
