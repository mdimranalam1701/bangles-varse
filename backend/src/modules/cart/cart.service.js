import { Cart } from "./cart.model.js";
import { Product } from "../product/product.model.js";
import { AppError } from "../../utils/errors.js";

export const addToCart = async (userId, productId, quantity = 1, size = "2.6") => {
    const product = await Product.findById(productId);
    if (!product || product.isActive === false) {
        throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }
    if (product.stock < quantity) {
        throw new AppError(`Only ${product.stock} left in stock`, 400, "OUT_OF_STOCK");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }

    const chosenSize = size || product.sizes?.[0] || "2.6";
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId.toString() && (item.size || "2.6") === chosenSize
    );

    if (existingItem) {
        const nextQty = existingItem.quantity + quantity;
        if (nextQty > product.stock) {
            throw new AppError(`Only ${product.stock} available in stock`, 400, "INSUFFICIENT_STOCK");
        }
        existingItem.quantity = nextQty;
    } else {
        cart.items.push({ product: productId, size: chosenSize, quantity });
    }

    await cart.save();
    return await getCart(userId);
};

export const updateCartQuantity = async (userId, productId, quantity, size) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError("Cart not found", 404, "CART_NOT_FOUND");
    }

    const itemIndex = cart.items.findIndex(
        (item) =>
            item.product.toString() === productId.toString() &&
            (!size || (item.size || "2.6") === size)
    );

    if (itemIndex === -1) {
        throw new AppError("Item not found in cart", 404, "ITEM_NOT_FOUND");
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        const product = await Product.findById(productId);
        if (product && quantity > product.stock) {
            throw new AppError(`Only ${product.stock} left in stock`, 400, "INSUFFICIENT_STOCK");
        }
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return await getCart(userId);
};

export const getCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId })
        .populate({
            path: "items.product",
            select: "name nameHi price compareAtPrice image category stock sizes material setCount owner",
            populate: { path: "owner", select: "name companyName phone whatsappNumber" },
        })
        .lean();

    if (!cart) {
        return { user: userId, items: [] };
    }

    // Remove deleted products automatically
    cart.items = (cart.items || []).filter((i) => i.product != null);
    return cart;
};

export const removeFromCart = async (userId, productId, size) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new AppError("Cart not found", 404, "CART_NOT_FOUND");
    }

    cart.items = cart.items.filter((item) => {
        if (item.product.toString() !== productId.toString()) return true;
        if (size && (item.size || "2.6") !== size) return true;
        return false;
    });

    await cart.save();
    return await getCart(userId);
};

export const clearCart = async (userId) => {
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
    return { user: userId, items: [] };
};
