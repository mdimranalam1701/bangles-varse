import express from "express";
import { z } from "zod";
import {
    addCredit,
    payCredit,
    getCredit,
    getMyCredits,
    getOwnerLedgers,
    settleCustomerCredit,
} from "./credit.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const creditAmountSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    ownerId: z.string().optional(),
    note: z.string().trim().max(200).optional(),
});

const settleSchema = z.object({
    customerId: z.string().min(1),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    note: z.string().trim().max(200).optional(),
});

router.get("/my", isAuth, getMyCredits);
router.get("/owner/ledgers", isAuth, authorizeRoles("owner", "admin"), getOwnerLedgers);
router.post("/owner/settle", isAuth, authorizeRoles("owner", "admin"), validate(settleSchema), settleCustomerCredit);

router.post("/add", isAuth, validate(creditAmountSchema), addCredit);
router.post("/pay/:ownerId", isAuth, validate(creditAmountSchema), payCredit);
router.get("/:ownerId", isAuth, getCredit);

export default router;
