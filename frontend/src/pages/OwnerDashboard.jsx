import { useState, useEffect, useRef } from "react";
import {
    FiPackage, FiDollarSign, FiShoppingCart, FiCreditCard,
    FiPlus, FiTrash2, FiTrendingUp, FiBox, FiEdit2, FiX, FiSave, FiCamera, FiUpload
} from "react-icons/fi";
import toast from "react-hot-toast";
import { dashboardAPI, productAPI, orderAPI, transactionAPI, uploadAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

const emptyForm = { name: "", description: "", price: "", category: "", stock: "", image: "" };

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");

    // Product form
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const productImageRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, prodRes, orderRes, txRes] = await Promise.all([
                dashboardAPI.getOwner(),
                productAPI.getOwnerProducts(),
                orderAPI.getOwnerOrders(),
                transactionAPI.getOwnerTransactions(),
            ]);
            setStats(dashRes.data?.data || dashRes.data);
            setProducts(prodRes.data?.data || []);
            setOrders(orderRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (p) => {
        setForm({
            name: p.name || "",
            description: p.description || "",
            price: String(p.price || ""),
            category: p.category || "",
            stock: String(p.stock || ""),
            image: p.image || "",
        });
        setEditingId(p._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock),
                image: form.image,
            };

            if (editingId) {
                await productAPI.update(editingId, payload);
                toast.success("Product updated!");
            } else {
                await productAPI.create(payload);
                toast.success("Product added!");
            }
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save product");
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
                    <h1 className="text-3xl font-serif font-bold text-gray-900">Owner Dashboard</h1>
                    <p className="text-gray-400">Welcome back, {user?.name}</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Product Form */}
            {showForm && (
                <div className="card p-6 mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif font-semibold text-lg">
                            {editingId ? "Edit Product" : "New Product"}
                        </h3>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <FiX size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                        <input
                            placeholder="Product name *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="input-field"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price (₹) *"
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
                            placeholder="Stock quantity"
                            value={form.stock}
                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            className="input-field"
                        />
                        <div className="sm:col-span-2">
                            <textarea
                                placeholder="Product description..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="input-field min-h-[80px] resize-none"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="Image URL (https://...)"
                                    value={form.image}
                                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                                    className="input-field flex-1"
                                />
                                <span className="text-gray-400 text-sm">or</span>
                                <button
                                    type="button"
                                    onClick={() => productImageRef.current?.click()}
                                    className="flex items-center gap-2 bg-gold-50 text-gold-700 font-medium py-3 px-4 rounded-xl hover:bg-gold-100 transition-colors border-2 border-gold-200 whitespace-nowrap"
                                >
                                    <FiUpload size={16} />
                                    Upload from Device
                                </button>
                                <input
                                    ref={productImageRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
                                        if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
                                        try {
                                            toast.loading("Uploading...");
                                            const formData = new FormData();
                                            formData.append("image", file);
                                            const { data } = await uploadAPI.image(formData);
                                            toast.dismiss();
                                            if (data.success) {
                                                setForm({ ...form, image: data.url });
                                                toast.success("Image uploaded!");
                                            } else {
                                                toast.error(data.message || "Upload failed");
                                            }
                                        } catch (err) {
                                            toast.dismiss();
                                            toast.error(err.response?.data?.message || "Upload failed");
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        {form.image && (
                            <div className="sm:col-span-2">
                                <div className="relative inline-block">
                                    <img src={form.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl border shadow-sm" onError={(e) => e.target.style.display = "none"} />
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, image: "" })}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="sm:col-span-2 flex gap-3">
                            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                                <FiSave size={16} />
                                {submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                {["overview", "products", "orders", "transactions"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-gold-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === "overview" && stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: <FiBox />, label: "Products", value: stats.totalProducts, tab: "products" },
                        { icon: <FiShoppingCart />, label: "Orders", value: stats.totalOrders, tab: "orders" },
                        { icon: <FiTrendingUp />, label: "Total Sales", value: `₹${(stats.totalSales || 0).toLocaleString("en-IN")}`, tab: "transactions" },
                        { icon: <FiCreditCard />, label: "Pending Credits", value: `₹${(stats.pendingCredits || 0).toLocaleString("en-IN")}`, tab: "transactions" },
                    ].map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setTab(s.tab)}
                            className="card p-5 text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gold-100 text-gold-600">
                                    {s.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{s.label}</p>
                                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                                </div>
                            </div>
                        </button>
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
                                    {p.description && <p className="text-xs text-gray-400 truncate">{p.description}</p>}
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <span>{p.category || "Uncategorized"}</span>
                                        <span>Stock: {p.stock}</span>
                                    </div>
                                </div>
                                <PriceTag amount={p.price} className="text-lg" />
                                <button
                                    onClick={() => startEdit(p)}
                                    className="text-gray-300 hover:text-gold-500 transition-colors p-2"
                                    title="Edit"
                                >
                                    <FiEdit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                    title="Delete"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Orders */}
            {tab === "orders" && (
                <div className="space-y-3">
                    {orders.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No orders yet.</p>
                    ) : (
                        orders.map((o) => (
                            <div key={o._id} className="card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="font-mono text-sm text-gray-500">#{o._id?.slice(-8).toUpperCase()}</p>
                                        <p className="text-sm text-gray-400">{o.user?.name || "Customer"} • {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={o.status} />
                                        <PriceTag amount={o.totalAmount} className="text-lg" />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {o.items?.map((item, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 bg-gold-50 text-gold-700 px-3 py-1 rounded-full text-sm">
                                            {item.product?.name || "Product"} × {item.quantity}
                                        </span>
                                    ))}
                                </div>
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
