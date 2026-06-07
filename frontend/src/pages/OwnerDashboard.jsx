import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    FiPackage, FiDollarSign, FiShoppingCart, FiCreditCard,
    FiPlus, FiTrash2, FiTrendingUp, FiBox, FiEdit2, FiX, FiSave, FiUpload,
    FiHome, FiBell, FiMenu, FiLogOut, FiUser, FiSettings, FiSearch, FiEye,
    FiChevronRight, FiGrid
} from "react-icons/fi";
import toast from "react-hot-toast";
import { dashboardAPI, productAPI, orderAPI, transactionAPI, uploadAPI, creditAPI, notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiDownload } from "react-icons/fi";

const emptyForm = { name: "", description: "", price: "", category: "", stock: "", image: "" };

// ── Sidebar ────────────────────────────────────────
function Sidebar({ tab, setTab, sidebarOpen, setSidebarOpen, navigate, unreadNotif }) {
    const menuItems = [
        { key: "overview", icon: <FiHome size={18} />, label: "Dashboard" },
        { key: "products", icon: <FiPackage size={18} />, label: "Products" },
        { key: "orders", icon: <FiShoppingCart size={18} />, label: "Orders" },
        { key: "credit", icon: <FiCreditCard size={18} />, label: "Credits" },
    ];
    return (
        <>
            {sidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`} style={{ zIndex: 60 }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                <div className="absolute bottom-20 left-0 w-24 h-24 bg-amber-400/10 rounded-full translate-y-12 -translate-x-12 blur-2xl" />

                <div className="p-6 border-b border-purple-700/50 relative">
                    <button onClick={() => { setTab("overview"); setSidebarOpen(false); }} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <span className="text-lg">✨</span>
                        </div>
                        <div>
                            <span className="text-lg font-bold text-white tracking-tight">Bangles Verse</span>
                            <p className="text-[10px] text-purple-300 -mt-0.5">Shop Dashboard</p>
                        </div>
                    </button>
                </div>

                <nav className="flex-1 p-4 relative">
                    <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <div className="space-y-1">
                        {menuItems.map(item => (
                            <button key={item.key} type="button" onClick={(e) => { e.stopPropagation(); setTab(item.key); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative z-10 ${tab === item.key ? "bg-white/10 text-amber-300 shadow-lg shadow-purple-900/50" : "text-purple-300 hover:bg-white/5 hover:text-white"}`}>
                                {tab === item.key && <div className="w-1 h-6 bg-amber-400 rounded-r-full -ml-3 mr-1" />}
                                <span className={tab === item.key ? "text-amber-400" : ""}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-3 mt-6 px-3">General</p>
                    <div className="space-y-1">
                        <button onClick={() => { navigate("/notifications"); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-white/5 hover:text-white transition-all">
                            <FiBell size={18} /> Notifications
                            {unreadNotif > 0 && <span className="ml-auto bg-amber-500 text-purple-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>}
                        </button>
                        <button onClick={() => { navigate("/transactions"); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-white/5 hover:text-white transition-all">
                            <FiDollarSign size={18} /> Payment History
                        </button>
                        <button onClick={() => { navigate("/my-shop"); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-white/5 hover:text-white transition-all">
                            <FiGrid size={18} /> My Shop
                        </button>
                        <button onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-white/5 hover:text-white transition-all">
                            <FiSettings size={18} /> Settings
                        </button>
                    </div>
                </nav>

                <div className="p-4 relative">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-5 border border-amber-500/20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full -translate-y-6 translate-x-6 blur-xl" />
                        <p className="text-amber-300 text-sm font-semibold mb-1">✨ Premium</p>
                        <p className="text-purple-300 text-xs mb-3">Your shop is live</p>
                        <button onClick={() => navigate("/my-shop")} className="bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 text-xs font-bold py-2 px-4 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
                            View Shop
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// ── Top Header ─────────────────────────────────────
function TopHeader({ user, sidebarOpen, setSidebarOpen, navigate, unreadNotif, profileOpen, setProfileOpen, profileRef, logout }) {
    return (
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-purple-100/50">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-purple-700"><FiMenu size={22} /></button>
                    <button onClick={() => navigate("/owner/dashboard")} className="flex items-center gap-2 lg:hidden">
                        <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center"><span className="text-sm">✨</span></div>
                        <span className="font-bold text-gray-900">Bangles Verse</span>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/chat")} className="relative p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"><FiGrid size={18} /></button>
                    <button onClick={() => navigate("/notifications")} className="relative p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors">
                        <FiBell size={18} />
                        {unreadNotif > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadNotif > 9 ? "9+" : unreadNotif}</span>}
                    </button>
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-3 border-l border-purple-100 hover:bg-purple-50 rounded-xl py-1.5 pr-2 transition-colors">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-purple-200">
                                {user?.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                <p className="text-[11px] text-purple-400">{user?.companyName || "Shop Owner"}</p>
                            </div>
                        </button>
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                    <p className="text-xs text-gray-400">{user?.email}</p>
                                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Shop Owner</span>
                                </div>
                                <button onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors"><FiUser size={15} /> My Profile</button>
                                <button onClick={() => { setProfileOpen(false); navigate("/my-shop"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors"><FiBox size={15} /> My Shop</button>
                                <button onClick={() => { setProfileOpen(false); navigate("/notifications"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors"><FiBell size={15} /> Notifications</button>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                    <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><FiLogOut size={15} /> Logout</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

// ── KPI Card ───────────────────────────────────────
function KPICard({ icon, label, value, featured, onClick }) {
    if (featured) {
        return (
            <button onClick={onClick} className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl p-5 text-white relative overflow-hidden col-span-full sm:col-span-1 text-left hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-400/10 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 text-amber-300">{icon}</div>
                    <p className="text-purple-200 text-sm mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </button>
        );
    }
    return (
        <button onClick={onClick} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all text-left">
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">{icon}</div>
                <FiChevronRight className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </button>
    );
}

// ── Main Dashboard ─────────────────────────────────
export default function OwnerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(searchParams.get("tab") || "overview");
    const [approvals, setApprovals] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [blockedCustomers, setBlockedCustomers] = useState([]);
    const [paymentModal, setPaymentModal] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentEntryId, setPaymentEntryId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [viewLedgerModal, setViewLedgerModal] = useState(null);
    const [viewTransactionModal, setViewTransactionModal] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const profileRef = useRef(null);
    const productImageRef = useRef(null);

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        const urlTab = searchParams.get("tab");
        if (urlTab && ["overview", "products", "orders", "transactions", "credit"].includes(urlTab)) {
            setTab(urlTab);
        }
    }, [searchParams]);
    useEffect(() => {
        if (!user) return;
        const f = async () => { try { const r = await notificationAPI.getUnreadCount(); setUnreadNotif(r.data?.data?.count || 0); } catch {} };
        f();
        const i = setInterval(f, 30000);
        return () => clearInterval(i);
    }, [user]);
    useEffect(() => {
        const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const fetchData = async () => {
        try {
            const [d, p, o, t, a, l, b] = await Promise.all([
                dashboardAPI.getOwner(), productAPI.getOwnerProducts(), orderAPI.getOwnerOrders(),
                transactionAPI.getOwnerTransactions(), creditAPI.getApprovals(), creditAPI.getOwnerAll(), creditAPI.getBlockedCustomers(),
            ]);
            setStats(d.data?.data || d.data);
            setProducts(p.data?.data || []);
            setOrders(o.data?.data || []);
            setTransactions(t.data?.data || []);
            setApprovals(a.data?.data || []);
            setLedgers(l.data?.data || []);
            setBlockedCustomers(b.data?.data || []);
        } catch {}
        setLoading(false);
    };

    const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };
    const startEdit = (p) => {
        setForm({ name: p.name || "", description: p.description || "", price: String(p.price || ""), category: p.category || "", stock: String(p.stock || ""), image: p.image || "" });
        setEditingId(p._id); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); setSubmitting(true);
        try {
            const payload = { name: form.name, description: form.description, price: Number(form.price), category: form.category, stock: Number(form.stock), image: form.image };
            if (editingId) { await productAPI.update(editingId, payload); toast.success("Product updated!"); }
            else { await productAPI.create(payload); toast.success("Product added!"); }
            resetForm(); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || "Failed to save product"); }
        setSubmitting(false);
    };
    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try { await productAPI.delete(id); toast.success("Product deleted"); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
    };
    const handleApprove = async (id) => { try { await creditAPI.approveCredit(id); toast.success("Credit approved!"); fetchData(); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } };
    const handleBlockCustomer = async (userId) => { try { await creditAPI.blockCustomer(userId); toast.success("Customer credit blocked!"); fetchData(); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } };
    const handleUnblockCustomer = async (userId) => { try { await creditAPI.unblockCustomer(userId); toast.success("Customer credit unblocked!"); fetchData(); } catch (err) { toast.error(err.response?.data?.message || "Failed"); } };
    const handleRecordPayment = async (e) => {
        e.preventDefault(); if (!paymentModal || !paymentAmount) return;
        try { await creditAPI.pay({ userId: paymentModal, amount: Number(paymentAmount), paymentMethod, entryId: paymentEntryId || undefined }); toast.success("Payment recorded!"); setPaymentModal(null); setPaymentAmount(""); setPaymentEntryId(null); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };
    const downloadPDF = async () => {
        const el = document.getElementById("ledger-modal-content"); if (!el || !viewLedgerModal) return;
        const canvas = await html2canvas(el, { scale: 2 }); const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4"); const w = pdf.internal.pageSize.getWidth(); const h = (canvas.height * w) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, w, h); pdf.save(`Balance_Sheet_${viewLedgerModal.user?.name.replace(/\s+/g, "_")}.pdf`);
    };
    const downloadTransactionPDF = async () => {
        const el = document.getElementById("transaction-modal-content"); if (!el || !viewTransactionModal) return;
        const canvas = await html2canvas(el, { scale: 2 }); const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4"); const w = pdf.internal.pageSize.getWidth(); const h = (canvas.height * w) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, w, h); pdf.save(`Transaction_${viewTransactionModal._id.slice(-8)}.pdf`);
    };

    const filteredSearch = (items, fields) => {
        if (!searchQuery) return items;
        return items.filter(item => fields.some(f => { const val = f.split(".").reduce((o, k) => o?.[k], item); return val?.toString().toLowerCase().includes(searchQuery.toLowerCase()); }));
    };

    const getCreditProducts = (entry) => {
        if (entry?.type !== "credit") return [];

        const desc = (entry.description || "").trim();
        const isGenericDesc = ["credit purchase", "order on credit", "credit sale"].includes(desc.toLowerCase());

        if (desc && !isGenericDesc) {
            return desc.split(",").map(p => p.trim()).filter(Boolean).map((p) => {
                const [name, quantity] = p.split(" × ");
                return { name: (name || p).trim(), quantity: quantity?.trim() };
            }).filter(p => p.name);
        }

        return (entry.orderId?.items || []).map((item) => ({
            name: item.product?.name,
            quantity: item.quantity,
        })).filter(p => p.name);
    };

    const formatCreditProducts = (entry) => {
        const products = getCreditProducts(entry);
        if (products.length === 0) return "Product not recorded";
        return products.map(p => p.quantity ? `${p.name} × ${p.quantity}` : p.name).join(", ");
    };

    if (loading) return <LoadingSpinner />;

    const pendingApprovals = approvals.filter(a => a.status === "pending");

    return (
        <div className="lg:ml-64 min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-amber-50/20">
            <Sidebar tab={tab} setTab={setTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigate={navigate} unreadNotif={unreadNotif} />
            <TopHeader user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigate={navigate} unreadNotif={unreadNotif} profileOpen={profileOpen} setProfileOpen={setProfileOpen} profileRef={profileRef} logout={logout} />

            <main className="p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* ── OVERVIEW ────────────────────── */}
                    {tab === "overview" && stats && (
                        <>
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name} — Here's your shop overview</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <KPICard icon={<FiPackage size={18} />} label="Products" value={stats.totalProducts} onClick={() => setTab("products")} />
                                <KPICard icon={<FiShoppingCart size={18} />} label="Orders" value={stats.totalOrders} onClick={() => setTab("orders")} />
                                <KPICard icon={<FiTrendingUp size={18} />} label="Total Sales" value={`₹${(stats.totalSales || 0).toLocaleString("en-IN")}`} featured onClick={() => setTab("transactions")} />
                                <KPICard icon={<FiCreditCard size={18} />} label="Pending Credits" value={`₹${(stats.pendingCredits || 0).toLocaleString("en-IN")}`} onClick={() => setTab("credit")} />
                            </div>

                            {/* Pending Approvals */}
                            {pendingApprovals.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
                                    <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">⚠️ {pendingApprovals.length} Credit Request{pendingApprovals.length > 1 ? "s" : ""} Pending</h3>
                                    <div className="space-y-3">
                                        {pendingApprovals.slice(0, 3).map(app => (
                                            <div key={app._id} className="flex items-center justify-between bg-white rounded-xl p-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{app.user?.name}</p>
                                                    <p className="text-sm text-gray-400">{app.user?.email}</p>
                                                </div>
                                                <button onClick={() => handleApprove(app._id)} className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Approve</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
                                    <div className="space-y-3">
                                        {orders.slice(0, 5).map(o => (
                                            <Link key={o._id} to={`/orders/${o._id}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-purple-50/30 -mx-2 px-2 rounded-lg transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">#{o._id?.slice(-8).toUpperCase()}</p>
                                                    <p className="text-[11px] text-gray-400">{o.user?.name || "Customer"} • {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={o.status} />
                                                    <PriceTag amount={o.totalAmount} className="text-sm" />
                                                </div>
                                            </Link>
                                        ))}
                                        {orders.length === 0 && <p className="text-gray-400 text-sm">No orders yet.</p>}
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                                    <div className="space-y-3">
                                        {transactions.slice(0, 5).map(tx => (
                                            <div key={tx._id} onClick={() => setViewTransactionModal(tx)} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-purple-50/30 -mx-2 px-2 rounded-lg transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{tx.note || "Transaction"}</p>
                                                    <p className="text-[11px] text-gray-400">{tx.user?.name || "Unknown"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <PriceTag amount={tx.amount} className="text-sm font-bold" />
                                                    <StatusBadge status={tx.type} />
                                                </div>
                                            </div>
                                        ))}
                                        {transactions.length === 0 && <p className="text-gray-400 text-sm">No transactions yet.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── PRODUCTS ────────────────────── */}
                    {tab === "products" && (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                                    <p className="text-gray-400 text-sm mt-1">{products.length} products in your shop</p>
                                </div>
                                <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-purple-200/40 hover:from-purple-500 hover:to-purple-600 transition-all active:scale-95 text-sm">
                                    <FiPlus size={16} /> Add Product
                                </button>
                            </div>

                            {showForm && (
                                <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-100 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg">{editingId ? "Edit Product" : "New Product"}</h3>
                                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                                        <input placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
                                        <input type="number" placeholder="Price (₹) *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                                            <option value="">Select category</option>
                                            <option value="Gold">Gold</option><option value="Silver">Silver</option><option value="Diamond">Diamond</option><option value="Platinum">Platinum</option><option value="Rose Gold">Rose Gold</option>
                                        </select>
                                        <input type="number" placeholder="Stock quantity" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                                        <div className="sm:col-span-2"><textarea placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px] resize-none" /></div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
                                            <div className="flex items-center gap-3">
                                                <input type="text" placeholder="Image URL (https://...)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field flex-1" />
                                                <span className="text-gray-400 text-sm">or</span>
                                                <button type="button" onClick={() => productImageRef.current?.click()} className="flex items-center gap-2 bg-purple-50 text-purple-700 font-medium py-3 px-4 rounded-xl hover:bg-purple-100 transition-colors border-2 border-purple-200 whitespace-nowrap">
                                                    <FiUpload size={16} /> Upload
                                                </button>
                                                <input ref={productImageRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files[0]; if (!file) return;
                                                    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
                                                    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
                                                    try { toast.loading("Uploading..."); const fd = new FormData(); fd.append("image", file);
                                                    const { data } = await uploadAPI.image(fd); toast.dismiss();
                                                    if (data.success) { setForm({ ...form, image: data.url }); toast.success("Image uploaded!"); }
                                                    else toast.error(data.message || "Upload failed");
                                                    } catch (err) { toast.dismiss(); toast.error(err.response?.data?.message || "Upload failed"); }
                                                }} />
                                            </div>
                                        </div>
                                        {form.image && (
                                            <div className="sm:col-span-2">
                                                <div className="relative inline-block">
                                                    <img src={form.image} alt="Preview" className="w-32 h-32 object-cover rounded-xl border shadow-sm" onError={(e) => e.target.style.display = "none"} />
                                                    <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"><FiX size={12} /></button>
                                                </div>
                                            </div>
                                        )}
                                        <div className="sm:col-span-2 flex gap-3">
                                            <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:from-purple-500 hover:to-purple-600 transition-all active:scale-95 text-sm disabled:opacity-50">
                                                <FiSave size={16} />{submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                                            </button>
                                            <button type="button" onClick={resetForm} className="border-2 border-purple-300 text-purple-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-purple-50 transition-all text-sm">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-3">
                                {products.length === 0 ? <p className="text-gray-400 text-center py-10">No products yet. Add your first product!</p> : products.map(p => (
                                    <div key={p._id} className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                                        <div className="w-16 h-16 bg-purple-50 rounded-xl overflow-hidden flex-shrink-0">
                                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">💎</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                                            {p.description && <p className="text-xs text-gray-400 truncate">{p.description}</p>}
                                            <div className="flex items-center gap-3 text-sm text-gray-400"><span>{p.category || "Uncategorized"}</span><span>Stock: {p.stock}</span></div>
                                        </div>
                                        <PriceTag amount={p.price} className="text-lg" />
                                        <button onClick={() => startEdit(p)} className="text-gray-300 hover:text-purple-500 transition-colors p-2" title="Edit"><FiEdit2 size={18} /></button>
                                        <button onClick={() => handleDelete(p._id)} className="text-gray-300 hover:text-red-500 transition-colors p-2" title="Delete"><FiTrash2 size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── ORDERS ──────────────────────── */}
                    {tab === "orders" && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                                <p className="text-gray-400 text-sm mt-1">{orders.length} orders received</p>
                            </div>
                            <div className="space-y-3">
                                {orders.length === 0 ? <p className="text-gray-400 text-center py-10">No orders yet.</p> : orders.map(o => {
                                    const firstImage = o.items?.[0]?.product?.image;
                                    return (
                                        <Link key={o._id} to={`/orders/${o._id}`} className="bg-white rounded-2xl p-4 block border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="w-full sm:w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                                                    {firstImage ? <img src={firstImage} alt="Product" className="w-full h-full object-cover" /> : <span className="text-2xl opacity-20">💎</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">Order #{o._id?.slice(-8).toUpperCase()}</p>
                                                            <p className="text-sm text-gray-500">{o.user?.name || "Customer"} • {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <PriceTag amount={o.totalAmount} className="text-lg font-bold" />
                                                            <StatusBadge status={o.status} />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {o.items?.map((item, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">{item.product?.name || "Product"} × {item.quantity}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ── TRANSACTIONS ────────────────── */}
                    {tab === "transactions" && (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                                    <p className="text-gray-400 text-sm mt-1">{transactions.length} transactions received</p>
                                </div>
                                <button onClick={() => navigate("/transactions")} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-700 bg-purple-50 py-2 px-4 rounded-xl hover:bg-purple-100 transition-colors">
                                    View Full History →
                                </button>
                            </div>

                            {/* Quick Stats */}
                            {transactions.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                        <p className="text-xs text-gray-500">Credit Given</p>
                                        <p className="text-xl font-bold text-red-500 mt-1">₹{transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0).toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                                        <p className="text-xs text-gray-500">Payments Received</p>
                                        <p className="text-xl font-bold text-green-600 mt-1">₹{transactions.filter(t => t.type === "payment").reduce((s, t) => s + t.amount, 0).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {transactions.length === 0 ? (
                                    <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                                        <FiDollarSign size={32} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-gray-400">No transactions yet</p>
                                    </div>
                                ) : transactions.slice(0, 10).map(tx => (
                                    <div key={tx._id} onClick={() => setViewTransactionModal(tx)} className="bg-white rounded-xl p-4 flex items-center gap-3 cursor-pointer border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                            {tx.type === "credit" ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{tx.note || (tx.type === "credit" ? "Credit Sale" : "Payment Received")}</p>
                                            <p className="text-xs text-gray-400">{tx.user?.name || "Customer"} • 📅 {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                                        </div>
                                        <span className={`font-bold text-sm ${tx.type === "credit" ? "text-red-500" : "text-green-600"}`}>
                                            {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── CREDIT ──────────────────────── */}
                    {tab === "credit" && (
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Credit Management</h1>
                                <p className="text-gray-400 text-sm mt-1">Manage customer credit approvals and payments</p>
                            </div>

                            {/* Approvals */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Pending Approvals</h3>
                                {approvals.filter(a => a.status === "pending").length === 0 ? <p className="text-gray-400 text-sm">No pending credit requests.</p> : (
                                    <div className="space-y-3">
                                        {approvals.filter(a => a.status === "pending").map(app => (
                                            <div key={app._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                                                <div><p className="font-medium text-gray-800">{app.user?.name}</p><p className="text-xs text-gray-400">{app.user?.email}</p></div>
                                                <button onClick={() => handleApprove(app._id)} className="bg-purple-600 text-white py-1.5 px-4 text-sm rounded-xl font-medium hover:bg-purple-700 transition-colors">Approve</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Ledgers */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Customer Credits</h3>
                                {ledgers.length === 0 ? <p className="text-gray-400 text-sm">No customers have bought on credit yet.</p> : (
                                    <div className="space-y-3">
                                        {ledgers.map(l => {
                                            const isBlocked = approvals.find(a => a.user?._id === l.user?._id)?.blocked;
                                            return (
                                                <div key={l._id} className="flex flex-wrap gap-4 items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-800">{l.user?.name}</p>
                                                            {isBlocked && <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">Blocked</span>}
                                                        </div>
                                                        <p className="text-xs text-gray-400">{l.user?.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right"><p className="text-xs text-gray-400">Outstanding</p><PriceTag amount={l.balance} className={`font-semibold ${l.balance > 0 ? "text-red-500" : "text-emerald-600"}`} /></div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setViewLedgerModal(l)} className="border border-purple-200 text-purple-700 py-1.5 px-4 text-sm rounded-xl font-medium hover:bg-purple-50 transition-colors whitespace-nowrap">View Statement</button>
                                                            {l.balance > 0 && <button onClick={() => setPaymentModal(l.user?._id)} className="bg-purple-600 text-white py-1.5 px-4 text-sm rounded-xl font-medium hover:bg-purple-700 transition-colors whitespace-nowrap">Record Payment</button>}
                                                            {isBlocked ? <button onClick={() => handleUnblockCustomer(l.user?._id)} className="py-1.5 px-4 text-sm rounded-xl font-medium bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors">Unblock</button> : <button onClick={() => handleBlockCustomer(l.user?._id)} className="py-1.5 px-4 text-sm rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">Block Credit</button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── MODALS ───────────────────────── */}
                {paymentModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 70 }}>
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-in shadow-2xl">
                            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-semibold text-gray-900">Record Payment</h3><button onClick={() => { setPaymentModal(null); setPaymentEntryId(null); }} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button></div>
                            <form onSubmit={handleRecordPayment} className="space-y-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="input-field" placeholder="Enter amount paid" min="1" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label><select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field"><option value="upi">UPI</option><option value="cash">Cash</option></select></div>
                                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-purple-500 hover:to-purple-600 transition-all mt-2">Save Payment</button>
                            </form>
                        </div>
                    </div>
                )}

                {viewLedgerModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col" style={{ zIndex: 70 }}>
                        <div className="bg-white flex-1 flex flex-col animate-fade-in overflow-hidden ml-0 lg:ml-64">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Balance Sheet</h3>
                                    <p className="text-sm text-gray-500">Customer: {viewLedgerModal.user?.name} • {viewLedgerModal.user?.email}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={downloadPDF} className="border border-purple-200 text-purple-700 py-2 px-4 text-sm rounded-xl font-medium hover:bg-purple-50 flex items-center gap-2"><FiDownload size={16} /> Download PDF</button>
                                    <button onClick={() => setViewLedgerModal(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full"><FiX size={20} /></button>
                                </div>
                            </div>
                            <div id="ledger-modal-content" className="flex-1 overflow-y-auto p-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
                                    <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                                        <p className="text-xs text-gray-500 mb-1">Credit Used</p>
                                        <p className="font-bold text-red-500 text-2xl">₹{viewLedgerModal.entries.filter(e => e.type === "credit").reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                                        <p className="text-xs text-gray-500 mb-1">Credit Paid</p>
                                        <p className="font-bold text-green-600 text-2xl">₹{viewLedgerModal.entries.filter(e => e.type === "payment").reduce((s, e) => s + e.amount, 0).toLocaleString("en-IN")}</p>
                                    </div>
                                    <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                                        <p className="text-xs text-gray-500 mb-1">Balance</p>
                                        <p className="font-bold text-purple-700 text-2xl">₹{viewLedgerModal.balance.toLocaleString("en-IN")}</p>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead><tr className="bg-gray-50 text-gray-500"><th className="py-4 px-4 font-semibold">Date</th><th className="py-4 px-4 font-semibold">Product</th><th className="py-4 px-4 font-semibold">Description</th><th className="py-4 px-4 font-semibold text-right">Credit Used (+)</th><th className="py-4 px-4 font-semibold text-right">Credit Paid (−)</th><th className="py-4 px-4 font-semibold text-right">Balance</th></tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {viewLedgerModal.entries.length === 0 ? <tr><td colSpan="6" className="py-10 text-center text-gray-400">No transactions yet.</td></tr> : (() => {
                                                let runningBalance = 0;
                                                return viewLedgerModal.entries.map((entry, idx) => {
                                                    if (entry.type === "credit") runningBalance += entry.amount;
                                                    else runningBalance -= entry.amount;
                                                    const products = getCreditProducts(entry);
                                                    return (
                                                        <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                                                            <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                                                            <td className="py-4 px-4">
                                                                {entry.type === "payment" ? (
                                                                    <span className="text-gray-400">—</span>
                                                                ) : (
                                                                    <div className="space-y-1">
                                                                        {products.length > 0 ? products.map((p, i) => {
                                                                            return (
                                                                                <div key={i} className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center text-purple-600 text-[10px] font-bold flex-shrink-0">💎</div>
                                                                                    <span className="font-medium text-gray-800">{p.name}</span>
                                                                                </div>
                                                                            );
                                                                        }) : <span className="font-medium text-gray-800">Product not recorded</span>}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                {entry.type === "payment" ? (
                                                                    <div>
                                                                        <p className="text-gray-700 font-medium">Payment received</p>
                                                                        <p className="text-xs text-gray-400 mt-0.5">via {entry.paymentMethod?.toUpperCase() || "CASH"}</p>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="text-gray-700 font-medium">{formatCreditProducts(entry)}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            {entry.status === "paid" && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Paid</span>}
                                                                            {entry.status === "pending" && <button onClick={() => { setPaymentModal(viewLedgerModal.user._id); setPaymentAmount(entry.amount); setPaymentEntryId(entry._id); setViewLedgerModal(null); }} className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-0.5 rounded-full font-medium">Mark Paid</button>}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-4 text-right font-medium text-red-500">{entry.type === "credit" ? `+₹${entry.amount.toLocaleString("en-IN")}` : "—"}</td>
                                                            <td className="py-4 px-4 text-right font-medium text-green-600">{entry.type === "payment" ? `-₹${entry.amount.toLocaleString("en-IN")}` : "—"}</td>
                                                            <td className={`py-4 px-4 text-right font-bold ${runningBalance > 0 ? "text-red-500" : "text-green-600"}`}>₹{runningBalance.toLocaleString("en-IN")}</td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewTransactionModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 70 }}>
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Transaction Details</h3>
                                <div className="flex gap-3"><button onClick={downloadTransactionPDF} className="border border-purple-200 text-purple-700 py-1.5 px-3 text-sm rounded-xl font-medium hover:bg-purple-50 flex items-center gap-2"><FiDownload size={16} /> Download</button><button onClick={() => setViewTransactionModal(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full"><FiX size={20} /></button></div>
                            </div>
                            <div id="transaction-modal-content" className="bg-white p-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-gray-500">Transaction ID</span><span className="font-mono font-medium text-gray-800">{viewTransactionModal._id}</span></div>
                                    <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-gray-500">Date</span><span className="font-medium text-gray-800">{new Date(viewTransactionModal.createdAt).toLocaleDateString("en-IN")}</span></div>
                                    <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-gray-500">Customer</span><span className="font-medium text-gray-800">{viewTransactionModal.user?.name || "Unknown"}</span></div>
                                    <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-gray-500">Type</span><StatusBadge status={viewTransactionModal.type} /></div>
                                    <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-gray-500">Note</span><span className="font-medium text-gray-800 text-right max-w-[200px]">{viewTransactionModal.note || "N/A"}</span></div>
                                    <div className="flex justify-between pt-2"><span className="text-gray-700 font-semibold text-lg">Amount</span><PriceTag amount={viewTransactionModal.amount} className="text-2xl font-bold text-purple-600" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
