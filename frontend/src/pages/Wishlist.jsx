import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { LoadingSpinner, EmptyState, PriceTag } from "../components/UI";

export default function Wishlist() {
    const { wishlist, toggleWishlist, fetchWishlist } = useWishlist();
    const { addToCart } = useCart();
    const products = wishlist?.products || [];
    const loading = !wishlist && products.length === 0;

    if (loading) return <LoadingSpinner />;

    if (products.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20">
                <EmptyState
                    icon="💝"
                    title="Your wishlist is empty"
                    description="Save items you love to your wishlist and come back to them anytime."
                    action={
                        <Link to="/products" className="btn-primary flex items-center gap-2">
                            <FiShoppingBag /> Browse Products
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                        My Wishlist <span className="text-gold-500">({products.length})</span>
                    </h1>
                    <p className="text-gray-400 mt-1">Items you've saved for later</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {products.map((product) => {
                    const p = typeof product === "string" ? null : product;
                    if (!p) return null;
                    return (
                        <div key={p._id} className="card group">
                            <Link to={`/products/${p._id}`} className="block relative overflow-hidden">
                                <div className="aspect-square bg-gradient-to-br from-gold-50 to-gold-100">
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><span className="text-6xl opacity-20">💎</span></div>
                                    )}
                                </div>
                                {p.category && (
                                    <span className="absolute top-3 left-3 badge bg-white/90 backdrop-blur-sm text-gold-700 shadow-sm">{p.category}</span>
                                )}
                            </Link>
                            <div className="p-5">
                                <Link to={`/products/${p._id}`}>
                                    <h3 className="font-serif font-semibold text-gray-800 group-hover:text-gold-600 transition-colors truncate text-lg">{p.name}</h3>
                                </Link>
                                <div className="flex items-center justify-between mt-3">
                                    <PriceTag amount={p.price} className="text-xl" />
                                    {p.averageRating > 0 && (
                                        <span className="text-sm text-gray-500">⭐ {p.averageRating?.toFixed(1)}</span>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => addToCart(p._id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold py-2.5 rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-300 shadow-md"
                                    >
                                        <FiShoppingBag size={16} /> Add to Cart
                                    </button>
                                    <button
                                        onClick={() => toggleWishlist(p._id)}
                                        className="p-2.5 rounded-xl border-2 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-all"
                                        title="Remove from wishlist"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
