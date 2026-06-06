import express from "express";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "./address.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuth);

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:addressId", updateAddress);
router.delete("/:addressId", deleteAddress);
router.put("/:addressId/default", setDefaultAddress);

export default router;
