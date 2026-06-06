import * as authService from "./auth.service.js";


export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


export const login = async (req, res) => {
    try {
        const data = await authService.loginUser(req.body);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user._id);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await authService.updateProfile(req.user._id, req.body);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};