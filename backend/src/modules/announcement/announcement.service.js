import { Announcement } from "./announcement.model.js";

export const createAnnouncement = async (data) => {
    return await Announcement.create(data);
};

export const getActiveAnnouncements = async (userRole) => {
    const now = new Date();
    const audience =
        userRole === "admin" ? "admins" : userRole === "owner" ? "owners" : "users";

    return await Announcement.find({
        isActive: true,
        $and: [
            { $or: [{ targetAudience: "all" }, { targetAudience: audience }] },
            {
                $or: [
                    { expiresAt: { $exists: false } },
                    { expiresAt: null },
                    { expiresAt: { $gt: now } },
                ],
            },
        ],
    }).sort({ createdAt: -1 });
};

export const getAllAnnouncements = async () => {
    return await Announcement.find().sort({ createdAt: -1 });
};

export const updateAnnouncement = async (id, data) => {
    return await Announcement.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAnnouncement = async (id) => {
    return await Announcement.findByIdAndDelete(id);
};
