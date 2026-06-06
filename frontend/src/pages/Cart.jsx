import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { PriceTag, EmptyState } from "../components/UI";

export default function Cart() {
    const { cart, removeFromCart, fetchCart } = useCart();
    const navigate = useNavigate();

    const items = cart?.items || [];
    const total = items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20">
                <EmptyState
                    icon="🛒"
                    title="Your cart is empty"
                    description="Looks like you haven't added any bangles to your cart yet."
                    action={
                        <Link to="/products" className="btn-primary flex items-center gap-2">
                            <FiShoppingBag /> Start Shopping
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gold-600 mb-6 transition-colors"
            >
                <FiArrowLeft /> Continue Shopping
            </button>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                Shopping Cart ({items.length})
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item._id || item.product?._id} className="card p-4 flex gap-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl overflow-hidden flex-shrink-0">
                                {item.product?.image ? (
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">💎</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/products/${item.product?._id}`}
                                    className="font-serif font-semibold text-gray-800 hover:text-gold-600 transition-colors block truncate"
                                >
                                    {item.product?.name || "Product"}
                                </Link>
                                {item.product?.category && (
                                    <span className="text-xs text-gray-400">{item.product.category}</span>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                                        <span className="text-sm text-gray-300">×</span>
                                        <PriceTag amount={item.product?.price || 0} className="text-sm" />
                                    </div>
                                    <PriceTag amount={(item.product?.price || 0) * item.quantity} className="text-lg" />
                                </div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.product?._id)}
                                className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                                title="Remove"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <h3 className="font-serif font-semibold text-lg text-gray-800 mb-4">Order Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <PriceTag amount={total} />
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between">
                                <span className="font-semibold text-gray-800 text-lg">Total</span>
                                <PriceTag amount={total} className="text-xl" />
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="btn-primary w-full mt-6 text-center"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
