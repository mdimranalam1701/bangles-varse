import * as creditService from "./credit.service.js";

// user requests credit approval
export const requestApproval = async (req, res) => {
    try {
        const { ownerId } = req.body;
        const approval = await creditService.requestApproval(req.user._id, ownerId);
        res.json({ success: true, data: approval });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// owner approves credit
export const approveCredit = async (req, res) => {
    try {
        const { approvalId } = req.params;
        const approval = await creditService.approveCredit(req.user._id, approvalId);
        res.json({ success: true, data: approval });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// get owner's approvals
export const getApprovals = async (req, res) => {
    try {
        const approvals = await creditService.getApprovals(req.user._id);
        res.json({ success: true, data: approvals });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// block a customer's credit
export const blockCustomer = async (req, res) => {
    try {
        const { userId } = req.params;
        const approval = await creditService.blockCustomerCredit(req.user._id, userId);
        res.json({ success: true, data: approval, message: "Customer credit blocked" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// unblock a customer's credit
export const unblockCustomer = async (req, res) => {
    try {
        const { userId } = req.params;
        const approval = await creditService.unblockCustomerCredit(req.user._id, userId);
        res.json({ success: true, data: approval, message: "Customer credit unblocked" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// get blocked customers
export const getBlockedCustomers = async (req, res) => {
    try {
        const blocked = await creditService.getBlockedCustomers(req.user._id);
        res.json({ success: true, data: blocked });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// get approval status for customer
export const getApprovalStatus = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const status = await creditService.getApprovalStatus(req.user._id, ownerId);
        res.json({ success: true, data: status });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// user buys on credit
export const addCredit = async (req, res) => {
    try {
        const { ownerId, amount, description, orderId } = req.body;
        const credit = await creditService.addCredit(req.user._id, ownerId, amount, description, orderId);
        res.json({ success: true, data: credit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// owner records payment from user
export const payCredit = async (req, res) => {
    try {
        const { userId, amount, paymentMethod, entryId } = req.body;
        // In this case, req.user._id is the owner
        const credit = await creditService.payCredit(userId, req.user._id, amount, paymentMethod, entryId);
        res.json({ success: true, data: credit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// customer pays credit via UPI or Cash
export const customerPay = async (req, res) => {
    try {
        const { ownerId, amount, transactionId, entryId, paymentMethod } = req.body;
        const credit = await creditService.customerPayCredit(req.user._id, ownerId, amount, transactionId, entryId, paymentMethod);
        res.json({ success: true, data: credit });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// view specific ledger
export const getCredit = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const credit = await creditService.getCredit(req.user._id, ownerId);
        res.json({ success: true, data: credit });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// view all customer ledgers for an owner
export const getOwnerCredits = async (req, res) => {
    try {
        const credits = await creditService.getOwnerCredits(req.user._id);
        res.json({ success: true, data: credits });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// view all credit ledgers for a customer
export const getCustomerCredits = async (req, res) => {
    try {
        const credits = await creditService.getCustomerCredits(req.user._id);
        res.json({ success: true, data: credits });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
