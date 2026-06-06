import { useState, useEffect } from "react";
import {
    FiPackage, FiDollarSign, FiShoppingCart, FiCreditCard,
    FiPlus, FiTrash2, FiTrendingUp, FiBox
} from "react-icons/fi";
import toast from "react-hot-toast";
import { dashboardAPI, productAPI, transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");

    // Add product form
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", price: "", category: "", stock: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, prodRes, txRes] = await Promise.all([
                dashboardAPI.getOwner(),
                productAPI.getAll({ limit: 100 }),
                transactionAPI.getMy(),
            ]);
            setStats(dashRes.data);
            setProducts(prodRes.data?.data?.products || []);
            setTransactions(txRes.data?.data || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await productAPI.create({
                name: form.name,
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
            });
            toast.success("Product added!");
            setShowForm(false);
            setForm({ name: "", price: "", category: "", stock: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add product");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await productAPI.delete(id);
            toast.success("Product deleted");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                        Owner Dashboard
                    </h1>
                    <p className="text-gray-400">Welcome back, {user?.name}</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Add Product Form */}
            {showForm && (
                <div className="card p-6 mb-8 animate-fade-in">
                    <h3 className="font-serif font-semibold text-lg mb-4">New Product</h3>
                    <form onSubmit={handleAddProduct} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            placeholder="Product name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="input-field"
                            required
                        />
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="input-field"
                        >
                            <option value="">Select category</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Diamond">Diamond</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Rose Gold">Rose Gold</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Stock"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            className="input-field"
                        />
                        <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? "Adding..." : "Add Product"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                {["overview", "products", "transactions"].map((t) => (
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

            {/* Overview */}
            {tab === "overview" && stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: <FiBox />, label: "Products", value: stats.totalProducts, color: "blue" },
                        { icon: <FiShoppingCart />, label: "Orders", value: stats.totalOrders, color: "green" },
                        { icon: <FiTrendingUp />, label: "Total Sales", value: `₹${(stats.totalSales || 0).toLocaleString("en-IN")}`, color: "purple" },
                        { icon: <FiCreditCard />, label: "Pending Credits", value: `₹${(stats.pendingCredits || 0).toLocaleString("en-IN")}`, color: "orange" },
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
            )}

            {/* Products */}
            {tab === "products" && (
                <div className="space-y-3">
                    {products.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No products yet. Add your first product!</p>
                    ) : (
                        products.map((p) => (
                            <div key={p._id} className="card p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gold-50 rounded-xl overflow-hidden flex-shrink-0">
                                    {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">💎</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <span>{p.category || "Uncategorized"}</span>
                                        <span>Stock: {p.stock}</span>
                                    </div>
                                </div>
                                <PriceTag amount={p.price} className="text-lg" />
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Transactions */}
            {tab === "transactions" && (
                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No transactions yet.</p>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx._id} className="card p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-700">{tx.note || "Transaction"}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={tx.type} />
                                    <PriceTag amount={tx.amount} className="text-lg" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
