import express from "express";

import { getOwnerDashboard } from "./dashboard.service.js";

import {
    isAuth,
    authorizeRoles,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/owner",isAuth,authorizeRoles("owner"),getOwnerDashboard);

export default router;