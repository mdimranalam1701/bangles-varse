import express from "express";

import { getOwnerDashboard } from "./dashboard.service.js";

import {
    isAuth,
    authorizeRoles,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/owner", isAuth, authorizeRoles("owner"), async (req, res) => {
    try {
        const data = await getOwnerDashboard(req.user._id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;