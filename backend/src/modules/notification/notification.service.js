import { Notification } from "./notification.model.js";

export const createNotification = async (receiver, title, message, type = "system", link = "") => {
    return await Notification.create({
        receiver,
        title,
        message,
        type,
        link,
    });
};

export const getMyNotifications = async (userId) => {
    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ receiver: userId }).sort({ createdAt: -1 }).limit(30).lean(),
        Notification.countDocuments({ receiver: userId, isread: false }),
    ]);

    return { notifications, unreadCount };
};

export const markAsRead = async (userId, notificationId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, receiver: userId },
        { $set: { isread: true } },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    await Notification.updateMany({ receiver: userId, isread: false }, { $set: { isread: true } });
    return { success: true };
};

export const deleteNotification = async (userId, notificationId) => {
    await Notification.findOneAndDelete({ _id: notificationId, receiver: userId });
    return { success: true };
};
