import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { PriceTag, EmptyState } from "../components/UI";
import { resolveAssetUrl } from "../services/api";

export default function Cart() {
    const { cart, updateQuantity, removeFromCart } = useCart();
    const { isHindi } = useLang();
    const navigate = useNavigate();

    const items = cart?.items || [];
    const total = items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
        0
    );

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16">
                <EmptyState
                    icon={ShoppingBag}
                    title={isHindi ? "आपका बैग खाली है" : "Your shopping bag is empty"}
                    description={
                        isHindi
                            ? "अपनी पसंद की चूड़ियाँ चुनें और आसानी से ऑर्डर करें।"
                            : "Browse our handcrafted bangles and add your favorite sets or order in 1 tap."
                    }
                    action={
                        <Link to="/products" className="btn-primary">
                            <ShoppingBag size={18} />
                            {isHindi ? "चूड़ियाँ देखें" : "Browse Bangles"}
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                type="button"
                onClick={() => navigate("/products")}
                className="inline-flex items-center gap-2 text-sm font-medium text-umber hover:text-sindoor-700 mb-6"
            >
                <ArrowLeft size={16} /> {isHindi ? "और चूड़ियाँ देखें" : "Continue Shopping"}
            </button>

            <h1 className="text-3xl font-serif font-bold text-ink mb-6">
                {isHindi ? "मेरा बैग" : "Shopping Bag"} ({items.length})
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => {
                        const prod = item.product;
                        if (!prod) return null;
                        const size = item.size || "2.6";
                        const imgSrc = resolveAssetUrl(prod.image) || "/images/products/gold-kada.svg";

                        return (
                            <div key={`${prod._id}-${size}`} className="card p-4 flex gap-4 items-center">
                                <Link to={`/products/${prod._id}`} className="w-20 h-20 rounded-lg bg-linen overflow-hidden shrink-0">
                                    <img src={imgSrc} alt={prod.name} className="w-full h-full object-cover" />
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${prod._id}`} className="font-serif font-bold text-lg text-ink hover:text-sindoor-700 truncate block">
                                        {isHindi && prod.nameHi ? prod.nameHi : prod.name}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-umber mt-0.5">
                                        <span className="badge bg-linen text-ink">
                                            {isHindi ? `नाप: ${size}` : `Size: ${size}`}
                                        </span>
                                        <PriceTag amount={prod.price} className="text-xs" />
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center border border-parchment rounded-lg bg-ivory">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(prod._id, item.quantity - 1, size)}
                                                aria-label="Decrease quantity"
                                                className="w-9 h-9 flex items-center justify-center hover:bg-linen"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-9 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(prod._id, item.quantity + 1, size)}
                                                aria-label="Increase quantity"
                                                className="w-9 h-9 flex items-center justify-center hover:bg-linen"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <PriceTag amount={prod.price * item.quantity} className="text-lg" />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFromCart(prod._id, size)}
                                    aria-label="Remove item"
                                    className="text-umber/60 hover:text-red-600 p-2 self-start"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24 space-y-4">
                        <h3 className="font-serif font-bold text-xl text-ink">
                            {isHindi ? "बिल का विवरण" : "Order Summary"}
                        </h3>
                        <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between text-umber">
                                <span>{isHindi ? "कुल सामान" : "Subtotal"}</span>
                                <PriceTag amount={total} />
                            </div>
                            <div className="flex justify-between text-umber">
                                <span>{isHindi ? "डिलीवरी शुल्क" : "Delivery"}</span>
                                <span className="text-emerald-700 font-semibold">
                                    {total >= 999 ? (isHindi ? "मुफ़्त" : "Free") : "₹60 (COD Free > ₹999)"}
                                </span>
                            </div>
                            <div className="border-t border-parchment pt-3 flex justify-between items-baseline">
                                <span className="font-bold text-ink">{isHindi ? "कुल देय राशि" : "Total"}</span>
                                <PriceTag amount={total} className="text-xl" />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/checkout")}
                            className="btn-primary w-full text-base"
                        >
                            {isHindi ? "ऑर्डर पक्का करने आगे बढ़ें" : "Proceed to Checkout"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
