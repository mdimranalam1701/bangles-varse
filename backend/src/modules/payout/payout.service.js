import { Payout } from "./payout.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { Notification } from "../notification/notification.model.js";

export const createPayout = async (ownerId, amount, paymentMethod = "upi", notes = "") => {
    const payout = await Payout.create({
        owner: ownerId,
        amount,
        paymentMethod,
        notes,
    });

    await Notification.create({
        receiver: ownerId,
        title: "Payout Initiated 💰",
        message: `A payout of ₹${amount.toLocaleString("en-IN")} has been initiated. It will be processed shortly.`,
    });

    return payout;
};

export const getAllPayouts = async (status = null) => {
    const query = status ? { status } : {};
    return await Payout.find(query)
        .populate("owner", "name email companyName upiId")
        .populate("processedBy", "name")
        .sort({ createdAt: -1 });
};

export const getOwnerPayouts = async (ownerId) => {
    return await Payout.find({ owner: ownerId }).sort({ createdAt: -1 });
};

export const updatePayoutStatus = async (payoutId, status, transactionId = "", processedBy = null) => {
    const payout = await Payout.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    payout.status = status;
    if (transactionId) payout.transactionId = transactionId;
    if (status === "completed" || status === "failed") {
        payout.processedAt = new Date();
        payout.processedBy = processedBy;
    }
    await payout.save();

    const statusMessages = {
        completed: `Your payout of ₹${payout.amount.toLocaleString("en-IN")} has been completed! 🎉`,
        failed: `Your payout of ₹${payout.amount.toLocaleString("en-IN")} has failed. Please contact support.`,
        processing: `Your payout of ₹${payout.amount.toLocaleString("en-IN")} is being processed.`,
    };

    if (statusMessages[status]) {
        await Notification.create({
            receiver: payout.owner,
            title: `Payout ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: statusMessages[status],
        });
    }

    return payout;
};

export const getOwnerEarnings = async (ownerId) => {
    const completedPayouts = await Payout.find({ owner: ownerId, status: "completed" });
    const totalPaid = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayouts = await Payout.find({ owner: ownerId, status: { $in: ["pending", "processing"] } });
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    return { totalPaid, totalPending, completedPayouts: completedPayouts.length };
};
