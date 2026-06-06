import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPackage, FiCalendar, FiDollarSign, FiCreditCard, FiUser, FiMapPin } from "react-icons/fi";
import { orderAPI } from "../services/api";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [id]);

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
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The order you are looking for does not exist or you don't have permission to view it."}</p>
                <button onClick={() => navigate(-1)} className="btn-primary inline-flex items-center gap-2">
                    <FiArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const isOwner = user?.role === "owner";

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-600 transition-colors mb-6 font-medium"
            >
                <FiArrowLeft /> Back to Orders
            </button>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Content - Items */}
                <div className="flex-1 space-y-6">
                    <div className="card p-6 bg-white shadow-sm border border-gray-100">
                        <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-4">
                            <div>
                                <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Order Details</h1>
                                <p className="text-sm text-gray-500 font-mono">Order #{order._id.toUpperCase()}</p>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Items Ordered</h3>
                        <div className="space-y-6">
                            {order.items?.map((item, index) => {
                                const p = item.product;
                                // If owner, highlight if it's their product
                                const isMyProduct = isOwner && p?.owner?.toString() === user._id.toString();

                                return (
                                    <div key={index} className={`flex flex-col sm:flex-row gap-6 py-4 ${index !== order.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                            {p?.image ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">💎</div>
                                            )}
                                            {isOwner && !isMyProduct && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                                    <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-full font-medium">Other Seller</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <Link 
                                                    to={`/products/${p?._id}`} 
                                                    className={`text-xl font-semibold hover:text-gold-600 transition-colors ${(!p || (isOwner && !isMyProduct)) ? 'pointer-events-none text-gray-500' : 'text-gray-900'}`}
                                                >
                                                    {p?.name || "Product Unavailable"}
                                                </Link>
                                                {p?.category && <p className="text-sm text-gray-500 mt-1">Category: {p.category}</p>}
                                                <p className="text-sm text-gray-500 mt-1">Qty: <span className="font-medium text-gray-800">{item.quantity}</span></p>
                                            </div>
                                            <div className="mt-4 sm:mt-0 flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Price:</span>
                                                <PriceTag amount={p?.price || 0} className="text-lg font-bold" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Summary & Details */}
                <div className="w-full md:w-80 space-y-6">
                    {/* Order Summary */}
                    <div className="card p-6 bg-white shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">Order Summary</h3>
                        
                        <div className="space-y-3 text-sm text-gray-600 border-b border-gray-100 pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><FiCalendar className="text-gold-500" /> Date</span>
                                <span className="text-right max-w-[120px] truncate" title={orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><FiCreditCard className="text-gold-500" /> Payment</span>
                                <span className="capitalize font-medium">
                                    {order.paymentType === 'cash' ? 'Cash on Delivery' : 
                                     order.paymentType === 'buy_on_credit' ? 'Buy on Credit' : 
                                     'Online Paid'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <PriceTag amount={order.totalAmount} />
                        </div>
                    </div>

                    {/* Customer Info (Visible to owner) */}
                    {isOwner && order.user && (
                        <div className="card p-6 bg-white shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
                                <FiUser className="text-gold-500" /> Customer
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gold-100 text-gold-700 rounded-full flex items-center justify-center font-bold text-lg">
                                    {order.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-gray-900 truncate">{order.user.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{order.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
