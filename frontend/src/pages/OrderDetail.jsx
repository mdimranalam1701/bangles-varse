import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPackage, FiCalendar, FiDollarSign, FiCreditCard, FiUser, FiMapPin, FiTruck, FiCheck, FiClock } from "react-icons/fi";
import { orderAPI } from "../services/api";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import OwnerLayout from "../components/OwnerLayout";

// ── Status Timeline ────────────────────────────────
function StatusTimeline({ status, statusHistory }) {
    const steps = [
        { key: "pending", label: "Placed", icon: <FiClock size={14} /> },
        { key: "confirmed", label: "Confirmed", icon: <FiCheck size={14} /> },
        { key: "processing", label: "Processing", icon: <FiPackage size={14} /> },
        { key: "shipped", label: "Shipped", icon: <FiTruck size={14} /> },
        { key: "delivered", label: "Delivered", icon: <FiCheck size={14} /> },
    ];
    const statusOrder = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(status);
    const isCancelled = status === "cancelled" || status === "returned";

    return (
        <div className="flex items-center justify-between w-full py-2">
            {steps.map((step, i) => {
                const stepIndex = statusOrder.indexOf(step.key);
                const isCompleted = !isCancelled && currentIndex >= stepIndex;
                const isCurrent = !isCancelled && status === step.key;
                return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative">
                        {i > 0 && <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${isCompleted ? "bg-purple-500" : "bg-gray-200"}`} />}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent ? "bg-purple-600 text-white ring-4 ring-purple-100 shadow-lg" :
                            isCompleted ? "bg-purple-500 text-white" :
                            "bg-gray-100 text-gray-400"
                        }`}>
                            {isCompleted && !isCurrent ? <FiCheck size={14} /> : step.icon}
                        </div>
                        <span className={`text-[10px] mt-1.5 font-medium ${isCurrent ? "text-purple-700" : isCompleted ? "text-purple-500" : "text-gray-400"}`}>{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Main Component ─────────────────────────────────
export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";

    useEffect(() => { fetchOrder(); }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await orderAPI.getById(id);
            setOrder(data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || "The order doesn't exist or you don't have permission."}</p>
                    <button onClick={() => navigate(-1)} className="bg-purple-600 text-white py-2.5 px-6 rounded-xl font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
                        <FiArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const accentColor = isOwner ? "purple" : "amber";
    const accent = {
        purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", btn: "bg-purple-600 hover:bg-purple-700", ring: "ring-purple-100", icon: "text-purple-500" },
        amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", btn: "bg-amber-600 hover:bg-amber-700", ring: "ring-amber-100", icon: "text-amber-500" },
    }[accentColor];

    const content = (
        <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 text-gray-500 hover:${accent.text} transition-colors mb-6 font-medium text-sm`}>
                <FiArrowLeft size={16} /> Back
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-sm text-gray-500 font-mono mt-1">#{order._id.toUpperCase()}</p>
                    </div>
                    <StatusBadge status={order.status} />
                </div>
                <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Items Ordered ({order.items?.length || 0})</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items?.map((item, index) => {
                                const p = item.product;
                                const isMyProduct = isOwner && p?.owner?.toString() === user._id.toString();
                                return (
                                    <div key={index} className="flex gap-4 p-5 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                            {p?.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">💎</div>}
                                            {isOwner && !isMyProduct && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="bg-gray-800 text-white text-[9px] px-2 py-0.5 rounded-full font-medium">Other</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <Link to={`/products/${p?._id}`} className={`font-semibold transition-colors truncate block ${(!p || (isOwner && !isMyProduct)) ? "pointer-events-none text-gray-500" : `text-gray-900 hover:${accent.text}`}`}>
                                                    {p?.name || "Product Unavailable"}
                                                </Link>
                                                {p?.category && <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-gray-500">Qty: <span className="font-medium text-gray-800">{item.quantity}</span></span>
                                                <PriceTag amount={(p?.price || 0) * item.quantity} className="text-base font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiMapPin className={accent.icon} size={16} /> Shipping Address</h3>
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                {order.shippingAddress.phone && <p className="mt-1">📞 {order.shippingAddress.phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Status History */}
                    {order.statusHistory?.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4">Status History</h3>
                            <div className="space-y-3">
                                {[...order.statusHistory].reverse().map((sh, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${i === 0 ? "bg-purple-500" : "bg-gray-300"}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 capitalize">{sh.status}</p>
                                            <p className="text-xs text-gray-400">{new Date(sh.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                                            {sh.note && <p className="text-xs text-gray-500 mt-0.5">{sh.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><FiCalendar size={14} /> Date</span><span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><FiCreditCard size={14} /> Payment</span><span className="font-medium text-gray-800 capitalize">{order.paymentType === "cash" ? "Cash on Delivery" : order.paymentType === "buy_on_credit" ? "Buy on Credit" : "Online Paid"}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-2"><FiPackage size={14} /> Items</span><span className="text-gray-800">{order.items?.length || 0}</span></div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">Total</span>
                            <PriceTag amount={order.totalAmount} className="text-xl font-bold" />
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="text-green-600">Discount ({order.couponCode})</span>
                                <span className="text-green-600 font-medium">-₹{order.discountAmount.toLocaleString("en-IN")}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Info (Owner only) */}
                    {isOwner && order.user && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiUser className={accent.icon} size={16} /> Customer</h3>
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 ${accent.bg} ${accent.text} rounded-xl flex items-center justify-center font-bold`}>
                                    {order.user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{order.user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{order.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tracking */}
                    {order.trackingNumber && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiTruck className={accent.icon} size={16} /> Tracking</h3>
                            <p className="text-sm text-gray-600 font-mono">{order.trackingNumber}</p>
                            {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className={`text-sm ${accent.text} font-medium mt-2 inline-block hover:underline`}>Track Package →</a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isOwner) return <OwnerLayout>{content}</OwnerLayout>;
    return <div className="max-w-5xl mx-auto px-4 py-8">{content}</div>;
}
