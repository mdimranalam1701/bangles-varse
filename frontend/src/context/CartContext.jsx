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
            const totalQty = (c?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
            setItemCount(totalQty);
        } catch {
            setCart(null);
            setItemCount(0);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId, quantity = 1, size = "2.6") => {
        if (!user) {
            toast.error("Please sign in to use your bag, or use 1-Tap Order Now!");
            return false;
        }
        try {
            const { data } = await cartAPI.add({ productId, quantity, size });
            const c = data.data;
            setCart(c);
            setItemCount((c?.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0));
            toast.success("Added to bag!");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add to bag");
            return false;
        }
    };

    const updateQuantity = async (productId, quantity, size) => {
        try {
            const { data } = await cartAPI.update({ productId, quantity, size });
            const c = data.data;
            setCart(c);
            setItemCount((c?.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0));
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update quantity");
        }
    };

    const removeFromCart = async (productId, size) => {
        try {
            const { data } = await cartAPI.remove(productId, size);
            const c = data.data;
            setCart(c);
            setItemCount((c?.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0));
            toast.success("Removed from bag");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove");
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, itemCount, addToCart, updateQuantity, removeFromCart, fetchCart }}
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
