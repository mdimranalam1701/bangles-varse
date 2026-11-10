import * as notificationService from "./notification.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const getNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getMyNotifications(req.user._id);
    res.json({
        success: true,
        data: result.notifications,
        unreadCount: result.unreadCount,
    });
});

export const markRead = asyncHandler(async (req, res) => {
    const updated = await notificationService.markAsRead(req.user._id, req.params.id);
    res.json({ success: true, data: updated });
});

export const markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user._id);
    res.json({ success: true, message: "All notifications marked as read" });
});
