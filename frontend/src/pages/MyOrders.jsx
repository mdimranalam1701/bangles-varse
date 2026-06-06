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

            <div className="space-y-4 stagger-children">
                {orders.map((order) => {
                    const firstImage = order.items?.[0]?.product?.image;

                    return (
                        <Link 
                            key={order._id} 
                            to={`/orders/${order._id}`}
                            className="card p-5 sm:p-6 block hover:border-gold-300/50 transition-all duration-300 bg-white border border-gold-100/30 group"
                        >
                            <div className="flex flex-col sm:flex-row gap-5">
                                {/* First product image */}
                                <div className="w-full sm:w-28 h-28 bg-gradient-to-br from-gold-50 to-gold-100/50 rounded-xl overflow-hidden flex-shrink-0 border border-gold-100/50 flex items-center justify-center group-hover:border-gold-200 transition-colors">
                                    {firstImage ? (
                                        <img src={firstImage} alt="Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-3xl opacity-20">💎</span>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className="font-bold text-gray-900 text-lg">
                                                    Order #{order._id?.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                                                {order.paymentType && (
                                                    <span className="ml-2 capitalize bg-gray-50 px-2 py-0.5 rounded-full text-xs">
                                                        {order.paymentType.replace(/_/g, ' ')}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <PriceTag amount={order.totalAmount} className="text-xl font-bold" />
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold-50">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <FiCalendar size={12} />
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </div>
                                        <span className="text-gold-600 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-200 flex items-center gap-1">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
