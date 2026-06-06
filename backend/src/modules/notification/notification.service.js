import { Notification } from "./notification.model.js";

export const createNotification = async (receiver, title, message, type = "info") => {
    return await Notification.create({ receiver, title, message, type });
};

export const getMyNotifications = async (userId) => {
    return await Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(100);
};

export const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({ receiver: userId, isread: false });
};

export const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: userId },
        { isread: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { receiver: userId, isread: false },
        { isread: true }
    );
};

export const deleteNotification = async (notificationId, userId) => {
    return await Notification.findOneAndDelete({ _id: notificationId, receiver: userId });
};
