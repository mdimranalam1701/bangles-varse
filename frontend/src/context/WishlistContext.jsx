import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { wishlistAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist(null);
            setWishlistIds(new Set());
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data } = await wishlistAPI.get();
            const w = data.data;
            setWishlist(w);
            setWishlistIds(
                new Set(w?.products?.map((p) => (typeof p === "string" ? p : p._id)) || [])
            );
        } catch {
            setWishlist(null);
            setWishlistIds(new Set());
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (productId) => {
        try {
            const { data } = await wishlistAPI.toggle(productId);
            await fetchWishlist();
            toast.success(
                data.message ||
                    (data.action === "added" ? "Saved to wishlist" : "Removed from wishlist")
            );
            return data.action;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update wishlist");
        }
    };

    const isInWishlist = (productId) => wishlistIds.has(productId);
    const wishlistItems = wishlist?.products || [];

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                wishlistItems,
                wishlistIds,
                loading,
                toggleWishlist,
                isInWishlist,
                isWishlisted: isInWishlist,
                fetchWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) {
        return {
            wishlist: null,
            wishlistItems: [],
            wishlistIds: new Set(),
            loading: false,
            toggleWishlist: async () => {},
            isInWishlist: () => false,
            isWishlisted: () => false,
            fetchWishlist: async () => {},
        };
    }
    return ctx;
}
