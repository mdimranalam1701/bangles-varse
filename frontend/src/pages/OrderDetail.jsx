import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { orderAPI, resolveAssetUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { LoadingSpinner, PriceTag, StatusBadge, OrderTimeline } from "../components/UI";

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const { isHindi } = useLang();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderAPI
            .getById(id)
            .then(({ data }) => setOrder(data.data))
            .catch(() => setOrder(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleReorder = async () => {
        try {
            await orderAPI.reorder(id);
            await fetchCart();
            toast.success("Items added back to your bag!");
            navigate("/cart");
        } catch (err) {
            toast.error(err.response?.data?.message || "Reorder failed");
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!order) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <p className="text-umber mb-4">Order not found.</p>
                <button type="button" onClick={() => navigate("/my-orders")} className="btn-primary">Back to Orders</button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-umber hover:text-sindoor-700">
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={() => window.print()} className="btn-secondary !py-2 !px-3 text-xs">
                        <Printer size={14} /> Print Receipt
                    </button>
                    <button type="button" onClick={handleReorder} className="btn-primary !py-2 !px-3 text-xs">
                        <RotateCcw size={14} /> Reorder
                    </button>
                </div>
            </div>

            <div className="card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-ink">
                            Order {order.orderCode || `#${order._id.slice(-6).toUpperCase()}`}
                        </h1>
                        <p className="text-xs text-umber mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                    </div>
                    <StatusBadge status={order.status} isHindi={isHindi} />
                </div>

                <OrderTimeline status={order.status} isHindi={isHindi} />

                <div className="border-t border-parchment pt-4 space-y-3">
                    {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src={resolveAssetUrl(item.image || item.product?.image) || "/images/products/gold-kada.svg"}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-linen"
                                />
                                <div>
                                    <p className="font-semibold text-sm text-ink">{item.name || item.product?.name}</p>
                                    <p className="text-xs text-umber">Size {item.size || "2.6"} × {item.quantity}</p>
                                </div>
                            </div>
                            <PriceTag amount={(item.price || item.product?.price || 0) * item.quantity} />
                        </div>
                    ))}
                </div>

                <div className="border-t border-parchment pt-4 flex justify-between items-baseline">
                    <span className="font-bold text-ink">Total ({order.paymentType?.toUpperCase()})</span>
                    <PriceTag amount={order.totalAmount} className="text-xl" />
                </div>
            </div>
        </div>
    );
}
