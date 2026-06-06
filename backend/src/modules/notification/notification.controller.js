import * as notificationService from "./notification.service.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getMyNotifications(req.user._id);
        const unreadCount = await notificationService.getUnreadCount(req.user._id);
        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        res.json({ success: true, data: { count } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id, req.user._id);
        res.json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        await notificationService.deleteNotification(req.params.id, req.user._id);
        res.json({ success: true, message: "Notification deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};