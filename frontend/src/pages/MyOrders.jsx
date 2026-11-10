import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Calendar, ShoppingBag, BookOpen, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { orderAPI, creditAPI, resolveAssetUrl } from "../services/api";
import { useLang } from "../context/LangContext";
import { LoadingSpinner, EmptyState, PriceTag, StatusBadge, OrderTimeline } from "../components/UI";

export default function MyOrders() {
    const { isHindi } = useLang();
    const [tab, setTab] = useState("orders");
    const [orders, setOrders] = useState([]);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [ordRes, credRes] = await Promise.all([orderAPI.getMy(), creditAPI.getMyAll()]);
            setOrders(ordRes.data?.data || []);
            setCredits(credRes.data?.data || []);
        } catch {
            setOrders([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCancel = async (orderId) => {
        if (!confirm(isHindi ? "क्या आप यह ऑर्डर रद्द करना चाहते हैं?" : "Cancel this order?")) return;
        try {
            await orderAPI.cancel(orderId);
            toast.success(isHindi ? "ऑर्डर रद्द किया गया" : "Order cancelled");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not cancel order");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-serif font-bold text-ink">
                    {isHindi ? "मेरे ऑर्डर और खाता" : "My Orders & Shop Khata"}
                </h1>
                <div className="flex bg-linen p-1 rounded-xl border border-parchment">
                    <button
                        type="button"
                        onClick={() => setTab("orders")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            tab === "orders" ? "bg-white text-sindoor-700 shadow-xs" : "text-umber"
                        }`}
                    >
                        {isHindi ? `ऑर्डर (${orders.length})` : `Orders (${orders.length})`}
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("khata")}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            tab === "khata" ? "bg-white text-sindoor-700 shadow-xs" : "text-umber"
                        }`}
                    >
                        {isHindi ? `दुकान खाता (${credits.length})` : `Khata Ledger (${credits.length})`}
                    </button>
                </div>
            </div>

            {tab === "orders" ? (
                orders.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title={isHindi ? "अभी कोई ऑर्डर नहीं है" : "No orders yet"}
                        description={
                            isHindi
                                ? "चूड़ियाँ पसंद करें और बिना झंझट ऑर्डर करें!"
                                : "You haven't placed any orders yet. Explore our handcrafted collections."
                        }
                        action={
                            <Link to="/products" className="btn-primary">
                                <ShoppingBag size={17} /> {isHindi ? "चूड़ियाँ देखें" : "Shop Bangles"}
                            </Link>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="card p-5 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <span className="font-mono font-bold text-base text-sindoor-700">
                                            {order.orderCode || `#${order._id?.slice(-6).toUpperCase()}`}
                                        </span>
                                        <div className="flex items-center gap-2 text-xs text-umber mt-0.5">
                                            <Calendar size={12} />
                                            <span>
                                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span>• {order.paymentType?.toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={order.status} isHindi={isHindi} />
                                        <PriceTag amount={order.totalAmount} className="text-lg" />
                                    </div>
                                </div>

                                <OrderTimeline status={order.status} isHindi={isHindi} />

                                <div className="border-t border-parchment pt-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-linen px-3 py-1.5 rounded-lg text-xs">
                                                <img
                                                    src={resolveAssetUrl(item.image || item.product?.image) || "/images/products/gold-kada.svg"}
                                                    alt=""
                                                    className="w-6 h-6 rounded object-cover"
                                                />
                                                <span className="font-semibold text-ink">{item.name || item.product?.name}</span>
                                                <span className="text-umber">({item.size || "2.6"} × {item.quantity})</span>
                                            </div>
                                        ))}
                                    </div>

                                    {["pending", "confirmed"].includes(order.status) && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(order._id)}
                                            className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                                        >
                                            <XCircle size={14} /> {isHindi ? "ऑर्डर रद्द करें" : "Cancel Order"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : credits.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title={isHindi ? "कोई बकाया खाता नहीं है" : "No Khata balances"}
                    description={
                        isHindi
                            ? "जब आप 'दुकान खाता (उधार)' से ऑर्डर करेंगे, तो यहाँ पूरा हिसाब दिखेगा।"
                            : "Orders placed via Shop Khata (buy now, pay later) appear here with full repayment history."
                    }
                />
            ) : (
                <div className="space-y-4">
                    {credits.map((c) => (
                        <div key={c._id} className="card p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-ink">
                                        {c.owner?.companyName || c.owner?.name || "Shop"}
                                    </h3>
                                    {c.owner?.phone && <p className="text-xs text-umber">Phone: {c.owner.phone}</p>}
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-umber block">{isHindi ? "बकाया राशि" : "Balance Due"}</span>
                                    <span className={`text-xl font-bold tabular-nums ${c.balance > 0 ? "text-sindoor-700" : "text-emerald-700"}`}>
                                        ₹{Number(c.balance || 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-parchment pt-3 space-y-1.5 max-h-48 overflow-y-auto text-xs">
                                {(c.entries || []).slice().reverse().map((e, i) => (
                                    <div key={i} className="flex justify-between items-center py-1">
                                        <span className="text-umber">
                                            {e.note || (e.type === "credit" ? "Credit Purchase" : "Payment")} •{" "}
                                            {new Date(e.date).toLocaleDateString("en-IN")}
                                        </span>
                                        <span className={`font-semibold tabular-nums ${e.type === "credit" ? "text-sindoor-700" : "text-emerald-700"}`}>
                                            {e.type === "credit" ? "+" : "-"}₹{e.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
