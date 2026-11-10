import express from "express";
import {
    getAllUsers,
    getUsersByRole,
    approveOwner,
    rejectOwner,
    getAdminStats,
    deleteUser,
    getOwnerDetail,
    getCustomerDetail,
    getOwnersSummary,
    getCustomersSummary,
} from "./admin.controller.js";

import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(isAuth, authorizeRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/role/:role", getUsersByRole);
router.get("/owners-summary", getOwnersSummary);
router.get("/customers-summary", getCustomersSummary);
router.get("/owner/:id", getOwnerDetail);
router.get("/customer/:id", getCustomerDetail);
router.put("/users/:id/approve", approveOwner);
router.put("/users/:id/reject", rejectOwner);
router.delete("/users/:id", deleteUser);

export default router;
