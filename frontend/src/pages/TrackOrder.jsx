import { useState } from "react";
import { Search, Package, Phone, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { orderAPI, resolveAssetUrl } from "../services/api";
import { useLang } from "../context/LangContext";
import { OrderTimeline, PriceTag, StatusBadge, EmptyState } from "../components/UI";

export default function TrackOrder() {
    const { t, isHindi, storeConfig } = useLang();
    const [query, setQuery] = useState("");
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            toast.error(isHindi ? "कृपया मोबाइल नंबर या ऑर्डर कोड लिखें" : "Please enter your mobile number or Order Code");
            return;
        }

        setLoading(true);
        try {
            const isCode = /^BV-/i.test(trimmed);
            const params = isCode ? { code: trimmed.toUpperCase() } : { phone: trimmed };
            const { data } = await orderAPI.track(params);
            setOrders(data.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not find orders");
            setOrders([]);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">{t("trackTitle")}</h1>
                <p className="text-umber mt-2 text-sm sm:text-base max-w-lg mx-auto">{t("trackSub")}</p>
            </div>

            <form onSubmit={handleSearch} className="card p-4 sm:p-5 mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" size={18} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={isHindi ? "मोबाइल नंबर (9876543210) या कोड (BV-1234)" : "Mobile number (e.g. 9811199988) or Code (BV-1234)"}
                            className="input-field !pl-10"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary shrink-0">
                        {loading ? "..." : t("trackButton")} <ArrowRight size={17} />
                    </button>
                </div>
            </form>

            {orders !== null && (
                orders.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title={isHindi ? "कोई ऑर्डर नहीं मिला" : "No orders found"}
                        description={
                            isHindi
                                ? "कृपया अपना 10 अंकों का मोबाइल नंबर या ऑर्डर कोड जांचें, या हमें कॉल करें।"
                                : "Double-check your 10-digit mobile number or BV-XXXX order code."
                        }
                        action={
                            <a href={`tel:${storeConfig.supportPhone}`} className="btn-secondary text-sm">
                                <Phone size={15} /> {isHindi ? "दुकान पर बात करें" : "Call Support"}
                            </a>
                        }
                    />
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => (
                            <div key={order._id} className="card p-5 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <span className="font-mono font-bold text-lg text-sindoor-700">
                                            {order.orderCode || `#${order._id.slice(-6).toUpperCase()}`}
                                        </span>
                                        <p className="text-xs text-umber mt-0.5">
                                            {order.customerName} {order.shippingAddress?.city ? `• ${order.shippingAddress.city}` : ""} •{" "}
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={order.status} isHindi={isHindi} />
                                        <PriceTag amount={order.totalAmount} className="text-lg" />
                                    </div>
                                </div>

                                <OrderTimeline status={order.status} isHindi={isHindi} />

                                <div className="border-t border-parchment pt-3 flex flex-wrap gap-3">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-linen/80 rounded-lg px-3 py-1.5 text-xs">
                                            <img
                                                src={resolveAssetUrl(item.image || item.product?.image) || "/images/products/gold-kada.svg"}
                                                alt=""
                                                className="w-7 h-7 rounded object-cover"
                                            />
                                            <span className="font-semibold text-ink">
                                                {item.name || item.product?.name}
                                            </span>
                                            <span className="text-umber">
                                                ({item.size || "2.6"} × {item.quantity})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

