import * as payoutService from "./payout.service.js";

export const createPayout = async (req, res) => {
    try {
        const { ownerId, amount, paymentMethod, notes } = req.body;
        const payout = await payoutService.createPayout(ownerId, amount, paymentMethod, notes);
        res.status(201).json({ success: true, data: payout });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getAllPayouts = async (req, res) => {
    try {
        const { status } = req.query;
        const payouts = await payoutService.getAllPayouts(status);
        res.json({ success: true, data: payouts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOwnerPayouts = async (req, res) => {
    try {
        const payouts = await payoutService.getOwnerPayouts(req.user._id);
        res.json({ success: true, data: payouts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updatePayoutStatus = async (req, res) => {
    try {
        const { status, transactionId } = req.body;
        const payout = await payoutService.updatePayoutStatus(
            req.params.id, status, transactionId, req.user._id
        );
        res.json({ success: true, data: payout });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getOwnerEarnings = async (req, res) => {
    try {
        const earnings = await payoutService.getOwnerEarnings(req.user._id);
        res.json({ success: true, data: earnings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
