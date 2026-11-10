import * as creditService from "./credit.service.js";
import { asyncHandler } from "../../utils/errors.js";

export const addCredit = asyncHandler(async (req, res) => {
    const { ownerId, amount, note } = req.body;
    const credit = await creditService.addCredit(req.user._id, ownerId, amount, note);
    res.json({ success: true, data: credit });
});

export const payCredit = asyncHandler(async (req, res) => {
    const ownerId = req.params.ownerId || req.body.ownerId;
    const { amount, note } = req.body;
    const credit = await creditService.payCredit(req.user._id, ownerId, amount, note);
    res.json({ success: true, data: credit });
});

export const getMyCredits = asyncHandler(async (req, res) => {
    const credits = await creditService.getUserCredits(req.user._id);
    res.json({ success: true, data: credits });
});

export const getOwnerLedgers = asyncHandler(async (req, res) => {
    const ledgers = await creditService.getOwnerCreditLedgers(req.user._id);
    res.json({ success: true, data: ledgers });
});

export const settleCustomerCredit = asyncHandler(async (req, res) => {
    const { customerId, amount, note } = req.body;
    const credit = await creditService.payCredit(
        customerId,
        req.user._id,
        amount,
        note || "Cash received at shop"
    );
    res.json({ success: true, data: credit });
});

export const getCredit = asyncHandler(async (req, res) => {
    const credit = await creditService.getCredit(req.user._id, req.params.ownerId);
    res.json({ success: true, data: credit });
});
