import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    FiPackage, FiDollarSign, FiShoppingCart, FiCreditCard,
    FiPlus, FiTrash2, FiTrendingUp, FiBox, FiEdit2, FiX, FiSave, FiCamera, FiUpload
} from "react-icons/fi";
import toast from "react-hot-toast";
import { dashboardAPI, productAPI, orderAPI, transactionAPI, uploadAPI, creditAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiDownload } from "react-icons/fi";

const emptyForm = { name: "", description: "", price: "", category: "", stock: "", image: "" };

export default function OwnerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");
    const [approvals, setApprovals] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [paymentModal, setPaymentModal] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentEntryId, setPaymentEntryId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [viewLedgerModal, setViewLedgerModal] = useState(null);
    const [viewTransactionModal, setViewTransactionModal] = useState(null);

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
            const [dashRes, prodRes, orderRes, txRes, appRes, ledgRes] = await Promise.all([
                dashboardAPI.getOwner(),
                productAPI.getOwnerProducts(),
                orderAPI.getOwnerOrders(),
                transactionAPI.getOwnerTransactions(),
                creditAPI.getApprovals(),
                creditAPI.getOwnerAll(),
            ]);
            setStats(dashRes.data?.data || dashRes.data);
            setProducts(prodRes.data?.data || []);
            setOrders(orderRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
            setApprovals(appRes.data?.data || []);
            setLedgers(ledgRes.data?.data || []);
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

    const handleApprove = async (id) => {
        try {
            await creditAPI.approveCredit(id);
            toast.success("Credit approved!");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve");
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!paymentModal || !paymentAmount) return;
        try {
            await creditAPI.pay({
                userId: paymentModal,
                amount: Number(paymentAmount),
                paymentMethod,
                entryId: paymentEntryId || undefined
            });
            toast.success("Payment recorded!");
            setPaymentModal(null);
            setPaymentAmount("");
            setPaymentEntryId(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to record payment");
        }
    };

    const downloadPDF = async () => {
        const element = document.getElementById("ledger-modal-content");
        if (!element || !viewLedgerModal) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Balance_Sheet_${viewLedgerModal.user?.name.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadTransactionPDF = async () => {
        const element = document.getElementById("transaction-modal-content");
        if (!element || !viewTransactionModal) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Transaction_${viewTransactionModal._id.slice(-8)}.pdf`);
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
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                {["overview", "products", "orders", "transactions", "credit"].map((t) => (
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
                        orders.map((o) => {
                            const firstImage = o.items?.[0]?.product?.image;

                            return (
                                <Link 
                                    key={o._id} 
                                    to={`/orders/${o._id}`}
                                    className="card p-4 block hover:border-gold-300 transition-all hover:shadow-md bg-white border border-transparent"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-full sm:w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                                            {firstImage ? (
                                                <img src={firstImage} alt="Product" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl opacity-20">💎</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        Order #{o._id?.slice(-8).toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {o.user?.name || "Customer"} • {new Date(o.createdAt).toLocaleDateString("en-IN")}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <PriceTag amount={o.totalAmount} className="text-lg font-bold" />
                                                    <StatusBadge status={o.status} />
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {o.items?.map((item, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 bg-gold-50 text-gold-700 px-3 py-1 rounded-full text-xs">
                                                        {item.product?.name || "Product"} × {item.quantity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
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
                            <div 
                                key={tx._id} 
                                onClick={() => setViewTransactionModal(tx)}
                                className="card p-4 flex items-center justify-between cursor-pointer hover:border-gold-300 transition-all hover:shadow-md border border-transparent"
                            >
                                <div>
                                    <p className="font-medium text-gray-700">{tx.note || "Transaction"}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(tx.createdAt).toLocaleDateString("en-IN")} • Customer: {tx.user?.name || "Unknown"}
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

            {/* Credit Management */}
            {tab === "credit" && (
                <div className="space-y-8">
                    {/* Approvals */}
                    <div className="card p-6">
                        <h3 className="font-serif font-semibold text-gray-800 mb-4">Pending Approvals</h3>
                        {approvals.filter(a => a.status === "pending").length === 0 ? (
                            <p className="text-gray-400 text-sm">No pending credit requests.</p>
                        ) : (
                            <div className="space-y-3">
                                {approvals.filter(a => a.status === "pending").map((app) => (
                                    <div key={app._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-800">{app.user?.name}</p>
                                            <p className="text-xs text-gray-400">{app.user?.email}</p>
                                        </div>
                                        <button onClick={() => handleApprove(app._id)} className="btn-primary py-1.5 px-4 text-sm">
                                            Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ledgers */}
                    <div className="card p-6">
                        <h3 className="font-serif font-semibold text-gray-800 mb-4">Customer Credits</h3>
                        {ledgers.length === 0 ? (
                            <p className="text-gray-400 text-sm">No customers have bought on credit yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {ledgers.map((l) => (
                                    <div key={l._id} className="flex flex-wrap gap-4 items-center justify-between p-4 border border-gray-100 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-800">{l.user?.name}</p>
                                            <p className="text-xs text-gray-400">{l.user?.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Outstanding</p>
                                                <PriceTag amount={l.balance} className="font-semibold text-red-500" />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setViewLedgerModal(l)} className="btn-secondary py-1.5 px-4 text-sm whitespace-nowrap bg-white text-gray-700 hover:bg-gray-50 border-gray-200">
                                                    View Statement
                                                </button>
                                                {l.balance > 0 && (
                                                    <button onClick={() => setPaymentModal(l.user?._id)} className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap">
                                                        Record Payment
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-in shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-serif font-semibold text-gray-900">Record Payment</h3>
                            <button onClick={() => { setPaymentModal(null); setPaymentEntryId(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="input-field"
                                    placeholder="Enter amount paid"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="upi">UPI</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>
                            <button type="submit" className="btn-primary w-full mt-2">
                                Save Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Ledger Modal */}
            {viewLedgerModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 animate-fade-in shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-xl font-serif font-semibold text-gray-900">Balance Sheet</h3>
                                <p className="text-sm text-gray-500 mt-1">Customer: {viewLedgerModal.user?.name}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={downloadPDF} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                                    <FiDownload size={16} /> Download PDF
                                </button>
                                <button onClick={() => setViewLedgerModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>
                        
                        <div id="ledger-modal-content" className="flex-1 overflow-y-auto pr-2 bg-white p-2">
                            <h4 className="font-semibold text-gray-700 mb-4 hidden print:block text-center">
                                Customer Balance Sheet - {viewLedgerModal.user?.name}
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex justify-between items-center border border-gray-100">
                                <span className="font-medium text-gray-600">Total Outstanding Balance:</span>
                                <span className="text-2xl font-bold text-red-500">₹{viewLedgerModal.balance.toLocaleString("en-IN")}</span>
                            </div>

                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-100 text-gray-500">
                                        <th className="pb-3 pt-2 font-medium px-2">Date</th>
                                        <th className="pb-3 pt-2 font-medium px-2">Type</th>
                                        <th className="pb-3 pt-2 font-medium px-2">Details</th>
                                        <th className="pb-3 pt-2 font-medium text-right px-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewLedgerModal.entries.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-6 text-center text-gray-400">No transactions recorded yet.</td>
                                        </tr>
                                    ) : (
                                        viewLedgerModal.entries.map((entry, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-2 text-gray-600 whitespace-nowrap">
                                                    {new Date(entry.date).toLocaleDateString("en-IN")}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <StatusBadge status={entry.type} />
                                                </td>
                                                <td className="py-3 px-2 text-gray-500">
                                                    {entry.type === "payment" 
                                                        ? `Payment Received (${entry.paymentMethod?.toUpperCase() || "CASH"})` 
                                                        : entry.status === "paid" ? "Credit Sale (Paid)" : "Credit Sale (Balance Increased)"}
                                                    {entry.type === "credit" && entry.status === "pending" && (
                                                        <button 
                                                            onClick={() => {
                                                                setPaymentModal(viewLedgerModal.user._id);
                                                                setPaymentAmount(entry.amount);
                                                                setPaymentEntryId(entry._id);
                                                            }}
                                                            className="ml-3 text-xs bg-gold-100 text-gold-700 hover:bg-gold-200 px-2 py-1 rounded-md transition-colors print:hidden font-medium"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2 text-right font-medium">
                                                    <span className={entry.type === "payment" ? "text-green-600" : "text-red-500"}>
                                                        {entry.type === "payment" ? "-" : "+"}₹{entry.amount.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* View Transaction Modal */}
            {viewTransactionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-serif font-semibold text-gray-900">Transaction Details</h3>
                            <div className="flex gap-3">
                                <button onClick={downloadTransactionPDF} className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-sm">
                                    <FiDownload size={16} /> Download
                                </button>
                                <button onClick={() => setViewTransactionModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        <div id="transaction-modal-content" className="bg-white p-2">
                            <div className="text-center mb-6 hidden print:block">
                                <h4 className="font-serif font-bold text-xl text-gray-800">Transaction Record</h4>
                                <p className="text-sm text-gray-500">{new Date(viewTransactionModal.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Transaction ID</span>
                                    <span className="font-mono font-medium text-gray-800">{viewTransactionModal._id}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-800">{new Date(viewTransactionModal.createdAt).toLocaleDateString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Customer</span>
                                    <span className="font-medium text-gray-800">{viewTransactionModal.user?.name || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Type</span>
                                    <StatusBadge status={viewTransactionModal.type} />
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-3">
                                    <span className="text-gray-500">Note</span>
                                    <span className="font-medium text-gray-800 text-right max-w-[200px]">{viewTransactionModal.note || "N/A"}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-700 font-semibold text-lg">Amount</span>
                                    <PriceTag amount={viewTransactionModal.amount} className="text-2xl font-bold text-gold-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
