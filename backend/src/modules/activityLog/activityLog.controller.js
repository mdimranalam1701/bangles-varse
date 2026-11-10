import * as activityLogService from "./activityLog.service.js";

export const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const result = await activityLogService.getActivityLogs(Number(page), Number(limit));
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getLogsByUser = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const result = await activityLogService.getLogsByUser(req.params.userId, Number(page), Number(limit));
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
