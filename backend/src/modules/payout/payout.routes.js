import express from "express";
import {
    createPayout,
    getAllPayouts,
    getOwnerPayouts,
    updatePayoutStatus,
    getOwnerEarnings,
} from "./payout.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Admin
router.post("/", isAuth, authorizeRoles("admin"), createPayout);
router.get("/", isAuth, authorizeRoles("admin"), getAllPayouts);
router.put("/:id/status", isAuth, authorizeRoles("admin"), updatePayoutStatus);

// Owner
router.get("/my", isAuth, authorizeRoles("owner"), getOwnerPayouts);
router.get("/earnings", isAuth, authorizeRoles("owner"), getOwnerEarnings);

export default router;
