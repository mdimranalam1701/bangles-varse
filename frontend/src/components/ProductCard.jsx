import { Link } from "react-router-dom";
import { FiShoppingCart, FiStar, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product._id);

    return (
        <div className="card group relative">
            {/* Image */}
            <div className="relative">
                <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">💎</span>
                            </div>
                        )}
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    {product.category && (
                        <span className="absolute top-3 left-3 badge bg-white/90 backdrop-blur-sm text-amber-700 shadow-sm border border-amber-100/50">
                            {product.category}
                        </span>
                    )}
                    {/* Quick view hint */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <span className="bg-white/90 backdrop-blur-sm text-amber-700 font-semibold text-sm py-2 px-5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Details
                        </span>
                    </div>
                </Link>
                {/* Wishlist Button — outside Link so click doesn't navigate */}
                {user?.role === "user" && (
                    <button
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
                        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                            inWishlist ? "bg-pink-500 text-white scale-110" : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-pink-500 hover:bg-pink-50"
                        }`}
                        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <FiHeart size={16} className={inWishlist ? "fill-current" : ""} />
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-5">
                <Link to={`/products/${product._id}`}>
                    <h3 className="font-serif font-semibold text-gray-800 group-hover:text-amber-600 transition-colors duration-300 truncate text-lg">
                        {product.name}
                    </h3>
                </Link>

                {product.owner?.name && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                        <span className="w-3 h-3 bg-amber-100 rounded-full inline-flex items-center justify-center text-[8px]">🏪</span>
                        {product.owner.name}
                    </p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    <div className="flex items-center gap-1">
                        {product.averageRating > 0 ? (
                            <>
                                <FiStar size={14} className="fill-gold-400 text-gold-400" />
                                <span className="text-sm text-gray-500 font-medium">
                                    {product.averageRating?.toFixed(1)}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-300">No reviews</span>
                        )}
                    </div>
                </div>

                {/* Stock */}
                <div className="mt-2.5">
                    {product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            In Stock ({product.stock})
                        </span>
                    ) : (
                        <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Add to Cart */}
                {user?.role === "user" && product.stock > 0 && (
                    <button
                        onClick={() => addToCart(product._id)}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-50 to-gold-100 text-amber-700 font-semibold py-2.5 rounded-xl hover:from-gold-500 hover:to-gold-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-gold-200/50 hover:border-gold-500"
                    >
                        <FiShoppingCart size={16} />
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}
