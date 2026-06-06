import { Notification } from "./notification.model.js";

export const createNotification  = async (
    receiver,
    title,
    message
) =>{
    return await Notification.create({
        receiver,
        title,
        message,
    });
};

export const getMyNotifications = async (userId) =>{
    return await Notification.find({
        receiver: userId,
    }).sort({createdAt: -1});
};
