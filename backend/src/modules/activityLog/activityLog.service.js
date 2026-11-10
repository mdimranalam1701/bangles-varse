import { ActivityLog } from "./activityLog.model.js";

export const logActivity = async (userId, action, details = "", targetType = "system", targetId = null, ipAddress = "") => {
    return await ActivityLog.create({
        user: userId,
        action,
        details,
        targetType,
        targetId,
        ipAddress,
    });
};

export const getActivityLogs = async (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const logs = await ActivityLog.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await ActivityLog.countDocuments();
    return { logs, total, page, totalPages: Math.ceil(total / limit) };
};

export const getLogsByUser = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const logs = await ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await ActivityLog.countDocuments({ user: userId });
    return { logs, total, page, totalPages: Math.ceil(total / limit) };
};
