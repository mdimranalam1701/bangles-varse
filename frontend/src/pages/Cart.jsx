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
                Shopping Cart <span className="text-gold-500">({items.length})</span>
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4 stagger-children">
                    {items.map((item) => (
                        <div key={item._id || item.product?._id} className="card p-5 flex gap-5 group">
                            <div className="w-28 h-28 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl overflow-hidden flex-shrink-0 border border-gold-100/50 group-hover:border-gold-200 transition-colors">
                                {item.product?.image ? (
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">💎</div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/products/${item.product?._id}`}
                                    className="font-serif font-semibold text-gray-800 hover:text-gold-600 transition-colors block truncate text-lg"
                                >
                                    {item.product?.name || "Product"}
                                </Link>
                                {item.product?.category && (
                                    <span className="inline-block mt-1 text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">{item.product.category}</span>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">Qty: {item.quantity}</span>
                                        <span className="text-sm text-gray-300">×</span>
                                        <PriceTag amount={item.product?.price || 0} className="text-sm" />
                                    </div>
                                    <PriceTag amount={(item.product?.price || 0) * item.quantity} className="text-lg" />
                                </div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.product?._id)}
                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 self-start p-2 rounded-lg"
                                title="Remove"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24 !shadow-xl !shadow-gold-100/20 border border-gold-100/30">
                        <h3 className="font-serif font-semibold text-xl text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gold-100 rounded-lg flex items-center justify-center text-gold-600">📋</span>
                            Order Summary
                        </h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <PriceTag amount={total} />
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="text-green-600 font-semibold flex items-center gap-1">✓ Free</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Tax</span>
                                <span className="text-gray-400">Included</span>
                            </div>
                            <div className="border-t border-gold-100 pt-4 flex justify-between">
                                <span className="font-bold text-gray-800 text-lg">Total</span>
                                <PriceTag amount={total} className="text-2xl" />
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="btn-primary w-full mt-6 text-center !py-4 !text-base"
                        >
                            Proceed to Checkout →
                        </button>
                        <Link to="/products" className="block text-center mt-4 text-sm text-gold-600 hover:text-gold-700 font-medium">
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
