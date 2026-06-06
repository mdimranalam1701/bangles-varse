import * as wishlistService from "./wishlist.service.js";

export const getWishlist = async (req, res) => {
    try {
        const wishlist = await wishlistService.getWishlist(req.user._id);
        res.json({ success: true, data: wishlist });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const toggleWishlistItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await wishlistService.toggleWishlist(req.user._id, productId);
        res.json({
            success: true,
            data: result.wishlist,
            action: result.action,
            message: result.action === "added" ? "Added to wishlist" : "Removed from wishlist",
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const removeItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const wishlist = await wishlistService.removeFromWishlist(req.user._id, productId);
        res.json({ success: true, data: wishlist });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const clear = async (req, res) => {
    try {
        const wishlist = await wishlistService.clearWishlist(req.user._id);
        res.json({ success: true, data: wishlist, message: "Wishlist cleared" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const inWishlist = await wishlistService.isInWishlist(req.user._id, productId);
        res.json({ success: true, data: { inWishlist } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
