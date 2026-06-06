import express from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "./notification.controller.js";

import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.get("/unread-count", isAuth, getUnreadCount);
router.put("/:id/read", isAuth, markAsRead);
router.put("/read-all", isAuth, markAllAsRead);
router.delete("/:id", isAuth, deleteNotification);

export default router;