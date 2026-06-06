import express from "express";

import {
    getMyTransactions,
    getAllTransactions
} from "./transaction.controller.js";


import {
    isAuth,
    authorizeRoles,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", isAuth, getMyTransactions);

router.get("/", isAuth,
    authorizeRoles("admin"),
    getAllTransactions
);

export default router;