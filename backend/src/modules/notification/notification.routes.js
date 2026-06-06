import express from "express";
import { getNotifications } from "./notification.controller.js";

import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);

export default router;