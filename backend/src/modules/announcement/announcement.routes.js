import express from "express";
import {
    createAnnouncement,
    getAnnouncements,
    getPublicAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
} from "./announcement.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/public", getPublicAnnouncements);

// Authenticated
router.get("/", isAuth, getAnnouncements);

// Admin only
router.post("/", isAuth, authorizeRoles("admin"), createAnnouncement);
router.put("/:id", isAuth, authorizeRoles("admin"), updateAnnouncement);
router.delete("/:id", isAuth, authorizeRoles("admin"), deleteAnnouncement);

export default router;
