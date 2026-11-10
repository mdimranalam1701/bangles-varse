import express from "express";
import { getNotifications, markRead, markAllRead } from "./notification.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.patch("/read-all", isAuth, markAllRead);
router.patch("/:id/read", isAuth, markRead);

export default router;
