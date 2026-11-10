import express from "express";
import {
    getWishlist,
    toggleWishlistItem,
    removeItem,
    clear,
    checkWishlist,
} from "./wishlist.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuth);

router.get("/", getWishlist);
router.post("/toggle/:productId", toggleWishlistItem);
router.delete("/remove/:productId", removeItem);
router.delete("/clear", clear);
router.get("/check/:productId", checkWishlist);

export default router;
