import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiCalendar, FiShoppingBag } from "react-icons/fi";
import { orderAPI } from "../services/api";
import { LoadingSpinner, EmptyState, PriceTag, StatusBadge } from "../components/UI";

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await orderAPI.getMy();
            setOrders(data.data || []);
        } catch {
            setOrders([]);
        }
        setLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20">
                <EmptyState
                    icon="📦"
                    title="No orders yet"
                    description="You haven't placed any orders. Start shopping to see your orders here!"
                    action={
                        <Link to="/products" className="btn-primary flex items-center gap-2">
                            <FiShoppingBag /> Shop Now
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Orders</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="card p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FiPackage className="text-gold-500" />
                                    <span className="font-mono text-sm text-gray-500">
                                        #{order._id?.slice(-8).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <FiCalendar size={12} />
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <StatusBadge status={order.status} />
                                <PriceTag amount={order.totalAmount} className="text-lg" />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-500 mb-2">
                                {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                                {order.paymentType && (
                                    <span className="ml-2">
                                        • {order.paymentType === "cash" ? "💵 Cash" : "💳 Online"}
                                    </span>
                                )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {order.items?.map((item, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 bg-gold-50 text-gold-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        {item.product?.name || "Product"} × {item.quantity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
