import { Wishlist } from "./wishlist.model.js";

export const getWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate("products");
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
};

export const toggleWishlist = async (userId, productId) => {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [productId] });
        return { wishlist, action: "added" };
    }

    const index = wishlist.products.findIndex(
        (p) => p.toString() === productId
    );

    if (index > -1) {
        wishlist.products.splice(index, 1);
        await wishlist.save();
        return { wishlist, action: "removed" };
    } else {
        wishlist.products.push(productId);
        await wishlist.save();
        return { wishlist, action: "added" };
    }
};

export const removeFromWishlist = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new Error("Wishlist not found");

    wishlist.products = wishlist.products.filter(
        (p) => p.toString() !== productId
    );
    await wishlist.save();
    return wishlist;
};

export const clearWishlist = async (userId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new Error("Wishlist not found");

    wishlist.products = [];
    await wishlist.save();
    return wishlist;
};

export const isInWishlist = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return false;
    return wishlist.products.some((p) => p.toString() === productId);
};
