import * as announcementService from "./announcement.service.js";

export const createAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.createAnnouncement({
            ...req.body,
            createdBy: req.user._id,
        });
        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = req.user?.role === "admin"
            ? await announcementService.getAllAnnouncements()
            : await announcementService.getActiveAnnouncements(req.user?.role || "user");
        res.json({ success: true, data: announcements });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPublicAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementService.getActiveAnnouncements("user");
        res.json({ success: true, data: announcements });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
        res.json({ success: true, data: announcement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        await announcementService.deleteAnnouncement(req.params.id);
        res.json({ success: true, message: "Announcement deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
