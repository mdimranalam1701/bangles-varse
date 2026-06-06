import { useState, useEffect } from "react";
import {
    FiShoppingCart, FiDollarSign, FiUsers, FiPackage
} from "react-icons/fi";
import { orderAPI, transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("orders");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [orderRes, txRes] = await Promise.all([
                orderAPI.getAll(),
                transactionAPI.getAll(),
            ]);
            setOrders(orderRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    if (loading) return <LoadingSpinner />;

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrders = orders.filter((o) => o.isPaid).length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome, {user?.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: <FiShoppingCart />, label: "Total Orders", value: orders.length, color: "blue" },
                    { icon: <FiDollarSign />, label: "Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "green" },
                    { icon: <FiPackage />, label: "Paid Orders", value: paidOrders, color: "purple" },
                    { icon: <FiUsers />, label: "Transactions", value: transactions.length, color: "orange" },
                ].map((s, i) => (
                    <div key={i} className="card p-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${s.color}-100 text-${s.color}-600`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{s.label}</p>
                                <p className="text-xl font-bold text-gray-800">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                {["orders", "transactions"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-gold-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {tab === "orders" && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                            No orders yet
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((o) => (
                                        <tr key={o._id} className="hover:bg-gold-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-500">
                                                #{o._id?.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {o.items?.length || 0} items
                                            </td>
                                            <td className="px-6 py-4">
                                                <PriceTag amount={o.totalAmount} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {o.paymentType === "cash" ? "💵 Cash" : "💳 Online"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={o.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(o.createdAt).toLocaleDateString("en-IN")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Transactions */}
            {tab === "transactions" && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Note</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                            No transactions
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gold-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-500">
                                                #{tx._id?.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={tx.type} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <PriceTag amount={tx.amount} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{tx.note}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
