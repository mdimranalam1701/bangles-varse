import { Link } from "react-router-dom";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();

    return (
        <div className="card group">
            {/* Image */}
            <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-gold-50 to-gold-100">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl opacity-30">💎</span>
                        </div>
                    )}
                </div>
                {product.category && (
                    <span className="absolute top-3 left-3 badge bg-white/90 backdrop-blur-sm text-gold-700 shadow-sm">
                        {product.category}
                    </span>
                )}
            </Link>

            {/* Info */}
            <div className="p-4">
                <Link to={`/products/${product._id}`}>
                    <h3 className="font-serif font-semibold text-gray-800 group-hover:text-gold-600 transition-colors truncate">
                        {product.name}
                    </h3>
                </Link>

                {product.owner?.name && (
                    <p className="text-xs text-gray-400 mt-1">by {product.owner.name}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gold-700">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    <div className="flex items-center gap-1">
                        {product.averageRating > 0 ? (
                            <>
                                <FiStar size={14} className="fill-gold-400 text-gold-400" />
                                <span className="text-sm text-gray-500">
                                    {product.averageRating?.toFixed(1)}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-300">No reviews</span>
                        )}
                    </div>
                </div>

                {/* Stock */}
                <div className="mt-2">
                    {product.stock > 0 ? (
                        <span className="text-xs text-green-600">✓ In Stock ({product.stock})</span>
                    ) : (
                        <span className="text-xs text-red-400">✗ Out of Stock</span>
                    )}
                </div>

                {/* Add to Cart */}
                {user?.role === "user" && product.stock > 0 && (
                    <button
                        onClick={() => addToCart(product._id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-gold-50 text-gold-700 font-medium py-2.5 rounded-xl hover:bg-gold-100 transition-colors"
                    >
                        <FiShoppingCart size={16} />
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
}
