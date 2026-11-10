import express from "express";
import { getNotifications, markRead, markAllRead, removeNotification } from "./notification.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.patch("/read-all", isAuth, markAllRead);
router.put("/read-all", isAuth, markAllRead);
router.patch("/:id/read", isAuth, markRead);
router.put("/:id/read", isAuth, markRead);
router.delete("/:id", isAuth, removeNotification);

export default router;
