import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { resolveAssetUrl } from "../services/api";
import { LoadingSpinner, EmptyState, PriceTag } from "../components/UI";

export default function Wishlist() {
    const { wishlist, loading, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { openQuickOrder, isHindi } = useLang();

    if (loading) return <LoadingSpinner />;

    if (wishlist.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <EmptyState
                    icon={Heart}
                    title={isHindi ? "पसंदीदा सूची खाली है" : "Your wishlist is empty"}
                    description={
                        isHindi
                            ? "दिल आइकन दबाकर अपनी पसंद की चूड़ियाँ यहाँ सेव करें।"
                            : "Tap the heart icon on any bangle to save it here for later."
                    }
                    action={
                        <Link to="/products" className="btn-primary">
                            <ShoppingBag size={17} /> {isHindi ? "चूड़ियाँ देखें" : "Explore Bangles"}
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-6">
                {isHindi ? "मेरी पसंदीदा चूड़ियाँ" : "Saved Wishlist"} ({wishlist.length})
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map((p) => (
                    <div key={p._id} className="card flex flex-col justify-between">
                        <div>
                            <Link to={`/products/${p._id}`} className="block aspect-square bg-linen overflow-hidden">
                                <img
                                    src={resolveAssetUrl(p.image) || "/images/products/gold-kada.svg"}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/products/${p._id}`} className="font-serif font-bold text-lg text-ink hover:text-sindoor-700 block truncate">
                                    {isHindi && p.nameHi ? p.nameHi : p.name}
                                </Link>
                                <PriceTag amount={p.price} compareAtPrice={p.compareAtPrice} className="mt-1" />
                            </div>
                        </div>
                        <div className="px-4 pb-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => openQuickOrder(p)}
                                className="btn-primary flex-1 !py-2 text-xs"
                            >
                                {isHindi ? "अभी खरीदें" : "Order Now"}
                            </button>
                            <button
                                type="button"
                                onClick={() => addToCart(p._id, 1)}
                                className="btn-secondary !py-2 !px-3"
                                title="Add to bag"
                            >
                                <ShoppingBag size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleWishlist(p._id)}
                                className="btn-secondary !py-2 !px-3 text-red-600"
                                title="Remove"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
