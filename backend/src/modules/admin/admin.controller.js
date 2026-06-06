import * as adminService from "./admin.service.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const users = await adminService.getUsersByRole(req.params.role);
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const approveOwner = async (req, res) => {
    try {
        const user = await adminService.approveOwner(req.params.id);
        res.json({ success: true, data: user, message: "Owner approved successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const rejectOwner = async (req, res) => {
    try {
        const user = await adminService.rejectOwner(req.params.id);
        res.json({ success: true, data: user, message: "Owner rejected" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const stats = await adminService.getAdminStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const result = await adminService.deleteUser(req.params.id);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
