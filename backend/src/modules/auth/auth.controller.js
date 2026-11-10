import * as authService from "./auth.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const register = asyncHandler(async (req, res) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
        success: true,
        data: result.user,
        token: result.token,
        user: result.user,
    });
});

export const login = asyncHandler(async (req, res) => {
    const data = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data });
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json({ success: true, data: user });
});
