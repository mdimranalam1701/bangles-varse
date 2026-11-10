import { useState, useEffect, useRef } from "react";
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    Upload,
    TrendingUp,
    ShoppingBag,
    Box,
    BookOpen,
    AlertTriangle,
    Phone,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    dashboardAPI,
    productAPI,
    orderAPI,
    transactionAPI,
    creditAPI,
    uploadAPI,
    resolveAssetUrl,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

const BANGLE_SIZES = ["2.2", "2.4", "2.6", "2.8", "2.10", "Free Size"];
const CATEGORIES = ["Bridal", "Gold", "Lac", "Glass", "Diamond", "Silver", "Rose Gold"];
const OCCASIONS = ["Bridal", "Festive", "Daily Wear", "Party", "Gift"];

const emptyForm = {
    name: "",
    nameHi: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "Gold",
    material: "22K Gold Plated",
    occasion: "Festive",
    setCount: "2",
    sizes: ["2.4", "2.6", "2.8"],
    stock: "10",
    image: "",
    isFeatured: false,
};

function SalesChart({ dailySales = [] }) {
    if (!dailySales.length) return null;
    const maxVal = Math.max(1, ...dailySales.map((d) => d.sales));

    return (
        <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-xl text-ink">Last 7 Days Revenue</h3>
                <span className="text-xs text-umber">Daily totals (excluding cancelled)</span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                {dailySales.map((d) => {
                    const pct = Math.max(6, Math.round((d.sales / maxVal) * 100));
                    return (
                        <div key={d.date} className="flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[10px] font-semibold text-umber tabular-nums">
                                {d.sales > 0 ? `₹${d.sales}` : "—"}
                            </span>
                            <div
                                style={{ height: `${pct}%` }}
                                className={`w-full max-w-[34px] rounded-t-md transition-all ${
                                    d.sales > 0 ? "bg-sindoor-600" : "bg-linen"
                                }`}
                                title={`${d.label}: ₹${d.sales} (${d.orders} orders)`}
                            />
                            <span className="text-[11px] font-medium text-umber">{d.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function OwnerDashboard() {
    const { user } = useAuth();
    const { isHindi } = useLang();

    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [settleInputs, setSettleInputs] = useState({});
    const fileRef = useRef(null);

    const fetchData = async () => {
        try {
            const [dashRes, prodRes, orderRes, ledgerRes, txRes] = await Promise.all([
                dashboardAPI.getOwner(),
                productAPI.getOwnerProducts(),
                orderAPI.getOwnerOrders(),
                creditAPI.getOwnerLedgers(),
                transactionAPI.getOwnerTransactions(),
            ]);
            setStats(dashRes.data?.data || null);
            setProducts(prodRes.data?.data || []);
            setOrders(orderRes.data?.data || []);
            setLedgers(ledgerRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
        } catch {
            // silent
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const startEdit = (p) => {
        setForm({
            name: p.name || "",
            nameHi: p.nameHi || "",
            description: p.description || "",
            price: String(p.price || ""),
            compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
            category: p.category || "Gold",
            material: p.material || "",
            occasion: p.occasion || "Festive",
            setCount: String(p.setCount || 2),
            sizes: p.sizes?.length ? p.sizes : ["2.4", "2.6", "2.8"],
            stock: String(p.stock ?? 0),
            image: p.image || "",
            isFeatured: Boolean(p.isFeatured),
        });
        setEditingId(p._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleSize = (s) => {
        setForm((prev) => ({
            ...prev,
            sizes: prev.sizes.includes(s) ? prev.sizes.filter((x) => x !== s) : [...prev.sizes, s],
        }));
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                name: form.name,
                nameHi: form.nameHi,
                description: form.description,
                price: Number(form.price),
                compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
                category: form.category,
                material: form.material,
                occasion: form.occasion,
                setCount: Number(form.setCount) || 2,
                sizes: form.sizes.length ? form.sizes : ["2.4", "2.6", "2.8"],
                stock: Number(form.stock) || 0,
                image: form.image,
                images: form.image ? [form.image] : [],
                isFeatured: form.isFeatured,
            };

            if (editingId) {
                await productAPI.update(editingId, payload);
                toast.success("Product updated!");
            } else {
                await productAPI.create(payload);
                toast.success("Bangle published!");
            }
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save product");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this bangle permanently?")) return;
        try {
            await productAPI.delete(id);
            toast.success("Deleted");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        }
    };

    const handleStatusUpdate = async (orderId, nextStatus) => {
        try {
            await orderAPI.updateStatus(orderId, { status: nextStatus });
            toast.success(`Order marked as ${nextStatus}`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update status");
        }
    };

    const handleSettleKhata = async (customerId) => {
        const amount = Number(settleInputs[customerId]);
        if (!amount || amount <= 0) {
            toast.error("Enter valid received amount");
            return;
        }
        try {
            await creditAPI.settleCustomer({ customerId, amount, note: "Cash received by shop" });
            toast.success(`Recorded ₹${amount} Khata payment`);
            setSettleInputs((prev) => ({ ...prev, [customerId]: "" }));
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to settle");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-ink">
                        {user?.companyName || (isHindi ? "दुकान डैशबोर्ड" : "Shop Owner Dashboard")}
                    </h1>
                    <p className="text-sm text-umber">
                        {user?.name} • {user?.isApproved ? "Verified Atelier" : "Pending Admin Approval"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                    className="btn-primary"
                >
                    <Plus size={18} /> {isHindi ? "नया कंगन जोड़ें" : "Add Bangle"}
                </button>
            </div>

            {!user?.isApproved && (
                <div className="bg-brass-50 border border-brass-200 rounded-xl p-4 text-sm text-brass-700 flex items-center gap-3">
                    <AlertTriangle size={18} />
                    <span>
                        Your shop account is awaiting admin approval. Once approved, your new bangles will appear in the storefront.
                    </span>
                </div>
            )}

            {/* Add / Edit Product Form */}
            {showForm && (
                <div className="card p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-serif font-bold text-xl text-ink">
                            {editingId ? "Edit Bangle" : "Publish New Bangle"}
                        </h2>
                        <button type="button" onClick={resetForm} className="text-umber hover:text-ink">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-umber mb-1">Product Name (English) *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Jaipur Kundan Kada Pair"
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-umber mb-1">Hindi Name (हिन्दी नाम)</label>
                            <input
                                value={form.nameHi}
                                onChange={(e) => setForm({ ...form, nameHi: e.target.value })}
                                placeholder="जैसे: जयपुरी कुंदन कड़ा"
                                className="input-field"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-umber mb-1">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-umber mb-1">MRP (₹)</label>
                                <input
                                    type="number"
                                    value={form.compareAtPrice}
                                    onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-umber mb-1">Category</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-umber mb-1">Occasion</label>
                            <select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} className="input-field">
                                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-umber mb-1">Bangles in Set</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.setCount}
                                    onChange={(e) => setForm({ ...form, setCount: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-umber mb-1">Stock Qty</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-umber mb-1">Material</label>
                            <input
                                value={form.material}
                                onChange={(e) => setForm({ ...form, material: e.target.value })}
                                placeholder="e.g. Pure Lac & Kundan"
                                className="input-field"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-umber mb-1">Available Sizes</label>
                            <div className="flex flex-wrap gap-2">
                                {BANGLE_SIZES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => toggleSize(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                                            form.sizes.includes(s)
                                                ? "bg-sindoor-600 text-white border-sindoor-600"
                                                : "bg-white text-ink border-parchment"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-semibold text-umber mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="input-field min-h-[72px] resize-none"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Image URL or upload from phone/PC..."
                                value={form.image}
                                onChange={(e) => setForm({ ...form, image: e.target.value })}
                                className="input-field flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="btn-brass"
                            >
                                <Upload size={16} /> Upload Photo
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    try {
                                        const fd = new FormData();
                                        fd.append("image", file);
                                        const { data } = await uploadAPI.image(fd);
                                        if (data.success) {
                                            setForm((prev) => ({ ...prev, image: data.url }));
                                            toast.success("Image uploaded!");
                                        }
                                    } catch (err) {
                                        toast.error(err.response?.data?.message || "Upload failed");
                                    }
                                }}
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                                <input
                                    type="checkbox"
                                    checked={form.isFeatured}
                                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                    className="w-4 h-4 accent-sindoor-600"
                                />
                                Featured on Home
                            </label>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                            <button type="submit" disabled={submitting} className="btn-primary">
                                <Save size={16} /> {submitting ? "Saving..." : editingId ? "Update Bangle" : "Publish Bangle"}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* KPI Grid */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: TrendingUp, label: "Total Revenue", value: `₹${(stats.totalSales || 0).toLocaleString("en-IN")}`, sub: `Today: ₹${(stats.todaySales || 0).toLocaleString("en-IN")}`, target: "orders" },
                        { icon: ShoppingBag, label: "Orders", value: stats.totalOrders, sub: `${stats.pendingOrders || 0} waiting action`, target: "orders" },
                        { icon: Box, label: "Catalog", value: stats.totalProducts, sub: `${stats.lowStockCount || 0} low stock`, target: "products" },
                        { icon: BookOpen, label: "Customer Khata Due", value: `₹${(stats.pendingCredits || 0).toLocaleString("en-IN")}`, sub: `${stats.creditCustomersCount || 0} active accounts`, target: "khata" },
                    ].map((k, i) => {
                        const Icon = k.icon;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setTab(k.target)}
                                className="card p-4 text-left hover:border-sindoor-400 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-umber">{k.label}</span>
                                    <Icon size={17} className="text-sindoor-600" />
                                </div>
                                <p className="text-2xl font-bold text-ink tabular-nums">{k.value}</p>
                                <p className="text-xs text-umber mt-0.5">{k.sub}</p>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-linen p-1 rounded-xl border border-parchment w-fit">
                {[
                    { key: "overview", label: "Overview" },
                    { key: "orders", label: `Orders (${orders.length})` },
                    { key: "products", label: `Products (${products.length})` },
                    { key: "khata", label: `Khata Ledgers (${ledgers.length})` },
                    { key: "transactions", label: "Transactions" },
                ].map((tItem) => (
                    <button
                        key={tItem.key}
                        type="button"
                        onClick={() => setTab(tItem.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            tab === tItem.key ? "bg-white text-sindoor-700 shadow-xs" : "text-umber hover:text-ink"
                        }`}
                    >
                        {tItem.label}
                    </button>
                ))}
            </div>

            {tab === "overview" && stats && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <SalesChart dailySales={stats.dailySales} />
                    <div className="card p-5 space-y-3">
                        <h3 className="font-serif font-bold text-xl text-ink">Low Stock Alerts (≤ 5 left)</h3>
                        {(stats.lowStockProducts || []).length === 0 ? (
                            <p className="text-sm text-emerald-700 flex items-center gap-2 py-4">
                                <CheckCircle2 size={16} /> All bangles have healthy stock.
                            </p>
                        ) : (
                            <div className="divide-y divide-parchment/70">
                                {stats.lowStockProducts.map((p) => (
                                    <div key={p._id} className="py-2.5 flex items-center justify-between text-sm">
                                        <span className="font-medium text-ink">{p.name}</span>
                                        <span className="badge bg-red-50 text-red-700">{p.stock} left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === "orders" && (
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <p className="text-umber text-center py-10">No orders yet.</p>
                    ) : (
                        orders.map((o) => (
                            <div key={o._id} className="card p-5 space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sindoor-700">
                                                {o.orderCode || `#${o._id.slice(-6).toUpperCase()}`}
                                            </span>
                                            <StatusBadge status={o.status} />
                                            <span className="badge bg-linen text-ink uppercase">{o.paymentType}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-ink mt-1">
                                            {o.customerName || o.user?.name || "Customer"}
                                            {(o.customerPhone || o.user?.phone) && (
                                                <a
                                                    href={`tel:${o.customerPhone || o.user?.phone}`}
                                                    className="ml-3 text-sindoor-700 hover:underline inline-flex items-center gap-1 text-xs"
                                                >
                                                    <Phone size={12} /> {o.customerPhone || o.user?.phone}
                                                </a>
                                            )}
                                        </p>
                                        {o.shippingAddress?.line1 && (
                                            <p className="text-xs text-umber">
                                                Address: {o.shippingAddress.line1} {o.shippingAddress.city} {o.shippingAddress.pincode}
                                            </p>
                                        )}
                                    </div>
                                    <PriceTag amount={o.totalAmount} className="text-xl" />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {o.items?.map((item, i) => (
                                        <span key={i} className="badge bg-linen text-ink">
                                            {item.name || item.product?.name} (Size {item.size || "2.6"} × {item.quantity})
                                        </span>
                                    ))}
                                </div>

                                {o.status !== "delivered" && o.status !== "cancelled" && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-parchment">
                                        {o.status === "pending" && (
                                            <button type="button" onClick={() => handleStatusUpdate(o._id, "confirmed")} className="btn-primary !py-1.5 !px-3 !min-h-[34px] text-xs">
                                                Confirm Order
                                            </button>
                                        )}
                                        {(o.status === "confirmed" || o.status === "paid" || o.status === "pending") && (
                                            <button type="button" onClick={() => handleStatusUpdate(o._id, "packed")} className="btn-brass !py-1.5 !px-3 !min-h-[34px] text-xs">
                                                Mark Packed
                                            </button>
                                        )}
                                        {["confirmed", "packed", "paid"].includes(o.status) && (
                                            <button type="button" onClick={() => handleStatusUpdate(o._id, "shipped")} className="btn-secondary !py-1.5 !px-3 !min-h-[34px] text-xs">
                                                Mark Shipped
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(o._id, "delivered")}
                                            className="bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700"
                                        >
                                            Mark Delivered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(o._id, "cancelled")}
                                            className="text-red-600 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-red-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "products" && (
                <div className="space-y-3">
                    {products.map((p) => (
                        <div key={p._id} className="card p-4 flex items-center gap-4">
                            <img
                                src={resolveAssetUrl(p.image) || "/images/products/gold-kada.svg"}
                                alt={p.name}
                                className="w-16 h-16 rounded-lg object-cover bg-linen shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-serif font-bold text-lg text-ink truncate">{p.name}</p>
                                <p className="text-xs text-umber">
                                    {p.category} • Stock: {p.stock} • Sizes: {(p.sizes || []).join(", ")}
                                </p>
                            </div>
                            <PriceTag amount={p.price} compareAtPrice={p.compareAtPrice} className="text-base" />
                            <button type="button" onClick={() => startEdit(p)} className="p-2 text-umber hover:text-sindoor-700" aria-label="Edit">
                                <Edit2 size={17} />
                            </button>
                            <button type="button" onClick={() => handleDelete(p._id)} className="p-2 text-umber hover:text-red-600" aria-label="Delete">
                                <Trash2 size={17} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tab === "khata" && (
                <div className="space-y-4">
                    {ledgers.length === 0 ? (
                        <p className="text-umber text-center py-10">No customer Khata accounts yet.</p>
                    ) : (
                        ledgers.map((l) => (
                            <div key={l._id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-serif font-bold text-lg text-ink">{l.user?.name || "Customer"}</p>
                                    <p className="text-xs text-umber">
                                        {l.user?.phone || l.user?.email} {l.user?.city ? `• ${l.user.city}` : ""}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="text-right mr-2">
                                        <span className="text-xs text-umber block">Due Balance</span>
                                        <span className={`text-lg font-bold tabular-nums ${l.balance > 0 ? "text-sindoor-700" : "text-emerald-700"}`}>
                                            ₹{Number(l.balance || 0).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    {l.balance > 0 && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Cash ₹"
                                                value={settleInputs[l.user?._id] || ""}
                                                onChange={(e) => setSettleInputs({ ...settleInputs, [l.user?._id]: e.target.value })}
                                                className="input-field !w-28 !min-h-[38px] !py-1.5 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleSettleKhata(l.user?._id)}
                                                className="btn-primary !py-2 !px-3 !min-h-[38px] text-xs"
                                            >
                                                Record Cash
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "transactions" && (
                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <p className="text-umber text-center py-10">No transactions recorded.</p>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx._id} className="card p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-ink text-sm">{tx.note || "Transaction"}</p>
                                    <p className="text-xs text-umber">
                                        {tx.user?.name || "Customer"} • {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={tx.type} />
                                    <PriceTag amount={tx.amount} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
