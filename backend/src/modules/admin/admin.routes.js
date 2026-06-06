import express from "express";
import {
    getAllUsers,
    getUsersByRole,
    approveOwner,
    rejectOwner,
    getAdminStats,
    deleteUser,
} from "./admin.controller.js";

import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require auth + admin role
router.use(isAuth, authorizeRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/role/:role", getUsersByRole);
router.put("/users/:id/approve", approveOwner);
router.put("/users/:id/reject", rejectOwner);
router.delete("/users/:id", deleteUser);

export default router;
