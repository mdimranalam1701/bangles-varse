import * as notificationService from "./notification.service.js";

export const getNotifications = async (req,res) =>{
    try{
        const notification =
        await notificationService.getMyNotification(
            req.user._id
        );

        res.json({
            success: true,
            data: notification,
        });
    } catch(err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};