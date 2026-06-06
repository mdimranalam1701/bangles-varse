import express from "express";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import * as creditController from "./credit.controller.js";

const router = express.Router();

router.use(isAuth);

// Approvals
router.post("/request-approval", authorizeRoles("user"), creditController.requestApproval);
router.get("/approval-status/:ownerId", authorizeRoles("user"), creditController.getApprovalStatus);
router.put("/approve/:approvalId", authorizeRoles("owner"), creditController.approveCredit);
router.get("/approvals", authorizeRoles("owner"), creditController.getApprovals);

// Credits & Payments
router.post("/add", authorizeRoles("user"), creditController.addCredit);
router.post("/pay", authorizeRoles("owner"), creditController.payCredit);
router.post("/customer-pay", authorizeRoles("user"), creditController.customerPay);

// View Ledgers
router.get("/customer-all", authorizeRoles("user"), creditController.getCustomerCredits);
router.get("/owner-all", authorizeRoles("owner"), creditController.getOwnerCredits);
router.get("/:ownerId", authorizeRoles("user", "owner"), creditController.getCredit);

export default router;
