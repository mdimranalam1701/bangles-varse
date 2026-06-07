import { Credit } from './credit.model.js';
import { CreditApproval } from './creditApproval.model.js';
import { createTransaction } from '../transaction/transaction.service.js';
import { Order } from '../order/order.model.js';

const GENERIC_CREDIT_DESCRIPTIONS = new Set([
    "credit purchase",
    "order on credit",
    "credit sale",
]);

const normalizeCreditDescription = (description) => {
    const clean = typeof description === "string" ? description.trim() : "";
    return GENERIC_CREDIT_DESCRIPTIONS.has(clean.toLowerCase()) ? "" : clean;
};

const buildOrderDescription = async (orderId) => {
    if (!orderId) return "";

    const order = await Order.findById(orderId)
        .populate("items.product", "name")
        .lean();

    return order?.items
        ?.map((item) => {
            const name = item.product?.name;
            if (!name) return null;
            return `${name} × ${item.quantity || 1}`;
        })
        .filter(Boolean)
        .join(", ") || "";
};

const creditEntryPopulate = {
    path: "entries.orderId",
    select: "items totalAmount createdAt",
    populate: { path: "items.product", select: "name" },
};

// Request Credit Approval
export const requestApproval = async (userId, ownerId) => {
    let approval = await CreditApproval.findOne({ user: userId, owner: ownerId });
    if (!approval) {
        approval = await CreditApproval.create({ user: userId, owner: ownerId, status: "pending" });
    }
    return approval;
};

// Approve Credit
export const approveCredit = async (ownerId, approvalId) => {
    const approval = await CreditApproval.findOneAndUpdate(
        { _id: approvalId, owner: ownerId },
        { status: "approved" },
        { new: true }
    );
    if (!approval) throw new Error("Approval request not found");
    return approval;
};

// Get Approvals for Owner
export const getApprovals = async (ownerId) => {
    return await CreditApproval.find({ owner: ownerId }).populate("user", "name email");
};

// Get Approval Status for Customer
export const getApprovalStatus = async (userId, ownerId) => {
    return await CreditApproval.findOne({ user: userId, owner: ownerId });
};

// Block a customer's credit
export const blockCustomerCredit = async (ownerId, userId) => {
    const approval = await CreditApproval.findOne({ user: userId, owner: ownerId });
    if (!approval) throw new Error("No credit approval found for this customer");
    if (approval.blocked) throw new Error("Customer credit is already blocked");

    approval.blocked = true;
    approval.blockedAt = new Date();
    await approval.save();
    return approval;
};

// Unblock a customer's credit
export const unblockCustomerCredit = async (ownerId, userId) => {
    const approval = await CreditApproval.findOne({ user: userId, owner: ownerId });
    if (!approval) throw new Error("No credit approval found for this customer");
    if (!approval.blocked) throw new Error("Customer credit is not blocked");

    approval.blocked = false;
    approval.blockedAt = null;
    await approval.save();
    return approval;
};

// Get blocked customers for an owner
export const getBlockedCustomers = async (ownerId) => {
    return await CreditApproval.find({ owner: ownerId, blocked: true })
        .populate("user", "name email phone");
};

//add credit (when user buy on credit)
export const addCredit = async (userId, ownerId, amount, description = "", orderId = null) => {
    // Check if customer credit is blocked
    const approval = await CreditApproval.findOne({ user: userId, owner: ownerId });
    if (approval && approval.blocked) {
        throw new Error("Your credit has been blocked by the shop owner. Please contact them.");
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

    const ledgerOrderId = orderId || null;
    const creditDescription = normalizeCreditDescription(description) || await buildOrderDescription(ledgerOrderId);

    credit.entries.push({
        type: "credit",
        amount,
        description: creditDescription,
        orderId: ledgerOrderId,
        status: "pending",
    });

    credit.balance += amount;

    await credit.save();

    //transaction entry
    await createTransaction({
        user: userId,
        owner: ownerId,
        amount,
        type: "credit",
        note: creditDescription ? `Credit purchase: ${creditDescription}` : "Order on credit",
    });

    return credit;
};

//pay credit
export const payCredit = async (userId, ownerId, amount, paymentMethod, entryId) => {
    const credit = await Credit.findOne({ user: userId, owner: ownerId });

    if (!credit) {
        throw new Error("No credit found");
    }

    if (entryId) {
        const targetEntry = credit.entries.id(entryId);
        if (targetEntry) {
            targetEntry.status = "paid";
        }
    }

    credit.entries.push({
        type: "payment",
        amount,
        paymentMethod: paymentMethod || "cash",
        status: "paid",
    });

    credit.balance -= amount;

    await credit.save();

    //transaction entry
    await createTransaction({
        user: userId,
        owner: ownerId,
        amount,
        type: "payment",
        note: `Credit payment via ${paymentMethod || "cash"}`,
    });

    return credit;
};

//customer pays credit via UPI or Cash
export const customerPayCredit = async (userId, ownerId, amount, transactionId, entryId, paymentMethod) => {
    const credit = await Credit.findOne({ user: userId, owner: ownerId });

    if (!credit) {
        throw new Error("No credit found");
    }

    if (entryId) {
        const targetEntry = credit.entries.id(entryId);
        if (targetEntry) {
            targetEntry.status = "paid";
        }
    }

    const method = paymentMethod || "upi";

    credit.entries.push({
        type: "payment",
        amount,
        paymentMethod: method,
        status: "paid",
    });

    credit.balance -= amount;

    await credit.save();

    //transaction entry
    await createTransaction({
        user: userId,
        owner: ownerId,
        amount,
        type: "payment",
        note: method === "cash" ? `Customer paid via Cash` : `Customer paid via UPI. Ref: ${transactionId}`,
    });

    return credit;
};

//get credit ledger
export const getCredit = async (userId, ownerId) => {
    return await Credit.findOne({ user: userId, owner: ownerId })
        .populate("user", "name email")
        .populate("owner", "name companyName")
        .populate(creditEntryPopulate);
};

// get all credit ledgers for owner
export const getOwnerCredits = async (ownerId) => {
    return await Credit.find({ owner: ownerId })
        .populate("user", "name email phone")
        .populate(creditEntryPopulate);
};

// get all credit ledgers for customer
export const getCustomerCredits = async (userId) => {
    return await Credit.find({ user: userId })
        .populate("owner", "name companyName upiId")
        .populate(creditEntryPopulate);
};
