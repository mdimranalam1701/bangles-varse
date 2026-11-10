import * as couponService from "./coupon.service.js";

export const createCoupon = async (req, res) => {
    try {
        const coupon = await couponService.createCoupon({ ...req.body, createdBy: req.user._id });
        res.status(201).json({ success: true, data: coupon, message: "Coupon created" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponService.getAllCoupons();
        res.json({ success: true, data: coupons });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const result = await couponService.validateCoupon(code, req.user._id, orderAmount);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const coupon = await couponService.applyCoupon(req.body.code, req.user._id);
        res.json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const coupon = await couponService.updateCoupon(req.params.id, req.body);
        res.json({ success: true, data: coupon, message: "Coupon updated" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        await couponService.deleteCoupon(req.params.id);
        res.json({ success: true, message: "Coupon deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const toggleCoupon = async (req, res) => {
    try {
        const coupon = await couponService.toggleCoupon(req.params.id);
        res.json({ success: true, data: coupon });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
