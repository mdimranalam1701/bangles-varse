import { Credit } from "./credit.model.js";
import { createTransaction } from "../transaction/transaction.service.js";
import { AppError } from "../../utils/errors.js";

export const addCredit = async (userId, ownerId, amount, note = "Order on credit", orderId = null) => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
        throw new AppError("Credit amount must be positive", 400, "INVALID_AMOUNT");
    }

    let credit = await Credit.findOne({ user: userId, owner: ownerId });
    if (!credit) {
        credit = await Credit.create({
            user: userId,
            owner: ownerId,
            entries: [],
            balance: 0,
        });
    }

    credit.entries.push({
        type: "credit",
        amount: numericAmount,
        note,
        ...(orderId ? { orderId } : {}),
    });
    credit.balance += numericAmount;
    await credit.save();

    await createTransaction({
        user: userId,
        owner: ownerId,
        amount: numericAmount,
        type: "credit",
        note,
    });

    return credit;
};

export const payCredit = async (userId, ownerId, amount, note = "Khata payment") => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
        throw new AppError("Payment amount must be greater than 0", 400, "INVALID_AMOUNT");
    }

    const credit = await Credit.findOne({ user: userId, owner: ownerId });
    if (!credit) {
        throw new AppError("No khata ledger found with this shop", 404, "CREDIT_NOT_FOUND");
    }

    credit.entries.push({
        type: "payment",
        amount: numericAmount,
        note,
    });
    credit.balance = Math.max(0, credit.balance - numericAmount);
    await credit.save();

    await createTransaction({
        user: userId,
        owner: ownerId,
        amount: numericAmount,
        type: "payment",
        note,
    });

    return credit;
};

export const getCredit = async (userId, ownerId) => {
    return await Credit.findOne({ user: userId, owner: ownerId })
        .populate("user", "name phone")
        .populate("owner", "name companyName phone")
        .lean();
};

export const getUserCredits = async (userId) => {
    return await Credit.find({ user: userId })
        .populate("owner", "name companyName phone whatsappNumber")
        .sort({ updatedAt: -1 })
        .lean();
};

export const getOwnerCreditLedgers = async (ownerId) => {
    return await Credit.find({ owner: ownerId })
        .populate("user", "name phone email address city")
        .sort({ balance: -1, updatedAt: -1 })
        .lean();
};
