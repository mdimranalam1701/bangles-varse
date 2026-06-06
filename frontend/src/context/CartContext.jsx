import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(null);
    const [itemCount, setItemCount] = useState(0);
    const { user } = useAuth();

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCart(null);
            setItemCount(0);
            return;
        }
        try {
            const { data } = await cartAPI.get();
            const c = data.data;
            setCart(c);
            setItemCount(c?.items?.length || 0);
        } catch {
            setCart(null);
            setItemCount(0);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartAPI.add({ productId, quantity });
            await fetchCart();
            toast.success("Added to cart!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add");
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await cartAPI.remove(productId);
            await fetchCart();
            toast.success("Removed from cart");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove");
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, itemCount, addToCart, removeFromCart, fetchCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
