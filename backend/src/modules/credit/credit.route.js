import express from "express";
import {
    addCredit,
    payCredit,
    getCredit,
} from "./credit.controller.js";


import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", isAuth, addCredit);
router.post("/pay/:ownerId", isAuth, payCredit);
router.get("/:ownerId", isAuth, getCredit);

export default router;
