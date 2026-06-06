import express from "express";
import { getLogs, getLogsByUser } from "./activityLog.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", isAuth, authorizeRoles("admin"), getLogs);
router.get("/user/:userId", isAuth, authorizeRoles("admin"), getLogsByUser);

export default router;
