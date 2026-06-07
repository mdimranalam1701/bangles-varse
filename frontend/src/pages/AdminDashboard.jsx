import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FiUsers, FiUserCheck, FiUserX, FiShoppingCart, FiDollarSign,
    FiPackage, FiTrash2, FiCheck, FiX, FiHome, FiCreditCard,
    FiTrendingUp, FiBox, FiSearch, FiBell, FiMenu, FiChevronRight,
    FiArrowLeft, FiEye, FiBarChart2, FiCalendar, FiClock, FiLogOut,
    FiUser, FiSettings
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminAPI, orderAPI, transactionAPI, notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

// ── Sidebar Component ──────────────────────────────
function Sidebar({ tab, setTab, setDetail, sidebarOpen, setSidebarOpen, navigate, unreadNotif }) {
    const menuItems = [
        { key: "dashboard", icon: <FiHome size={18} />, label: "Dashboard" },
        { key: "owners", icon: <FiBox size={18} />, label: "Shop Owners" },
        { key: "customers", icon: <FiUsers size={18} />, label: "Customers" },
        { key: "orders", icon: <FiShoppingCart size={18} />, label: "Orders" },
        { key: "transactions", icon: <FiDollarSign size={18} />, label: "Transactions" },
    ];

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <FiBox size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Bangles Verse</span>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <div className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => { setTab(item.key); setDetail(null); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    tab === item.key
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                            >
                                {tab === item.key && <div className="w-1 h-6 bg-emerald-500 rounded-r-full -ml-3 mr-1" />}
                                <span className={tab === item.key ? "text-emerald-600" : ""}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6 px-3">General</p>
                    <div className="space-y-1">
                        <button
                            onClick={() => { setSidebarOpen(false); navigate("/notifications"); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                        >
                            <FiBell size={18} />
                            Notifications
                            {unreadNotif > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { setSidebarOpen(false); navigate("/profile"); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                        >
                            <FiSettings size={18} />
                            Settings
                        </button>
                    </div>
                </nav>

                {/* Promo Card */}
                <div className="p-4">
                    <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
                        <p className="text-white text-sm font-semibold mb-1">Admin Panel</p>
                        <p className="text-gray-400 text-xs mb-3">Manage your platform</p>
                        <div className="w-8 h-1 bg-emerald-400 rounded-full" />
                    </div>
                </div>
            </aside>
        </>
    );
}

// ── KPI Card Component ─────────────────────────────
function KPICard({ icon, label, value, trend, featured }) {
    if (featured) {
        return (
            <div className="bg-emerald-900 rounded-2xl p-5 text-white relative overflow-hidden col-span-full sm:col-span-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-400/10 rounded-full translate-y-6 -translate-x-6" />
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3 text-emerald-300">
                        {icon}
                    </div>
                    <p className="text-emerald-200 text-sm mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {trend && <p className="text-emerald-300 text-xs mt-2 flex items-center gap-1"><FiTrendingUp size={12} /> {trend}</p>}
                </div>
            </div>
        );
    }
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    {icon}
                </div>
                <FiChevronRight className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && <p className="text-emerald-600 text-xs mt-2 flex items-center gap-1"><FiTrendingUp size={12} /> {trend}</p>}
        </div>
    );
}

// ── Bar Chart Component ────────────────────────────
function MiniBarChart({ data, labels }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((val, i) => {
                const height = (val / max) * 100;
                const isActive = i === data.length - 1;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[10px] text-gray-400 font-medium">{val > 0 ? `₹${(val / 1000).toFixed(0)}k` : ""}</div>
                        <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                                isActive ? "bg-emerald-500" : i % 2 === 0 ? "bg-emerald-200" : "bg-emerald-100"
                            }`}
                            style={{ height: `${Math.max(height, 8)}%` }}
                        />
                        <div className="text-[10px] text-gray-400">{labels[i]}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ── Donut Chart Component ──────────────────────────
function DonutChart({ completed, inProgress, pending }) {
    const total = completed + inProgress + pending || 1;
    const cPct = (completed / total) * 100;
    const iPct = (inProgress / total) * 100;
    const pPct = (pending / total) * 100;

    const r = 40;
    const circumference = 2 * Math.PI * r;
    const cLen = (cPct / 100) * circumference;
    const iLen = (iPct / 100) * circumference;
    const pLen = (pPct / 100) * circumference;

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#065f46" strokeWidth="12"
                        strokeDasharray={`${cLen} ${circumference - cLen}`}
                        strokeDashoffset="0" strokeLinecap="round" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#34d399" strokeWidth="12"
                        strokeDasharray={`${iLen} ${circumference - iLen}`}
                        strokeDashoffset={-cLen} strokeLinecap="round" />
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#d1d5db" strokeWidth="12"
                        strokeDasharray={`${pLen} ${circumference - pLen}`}
                        strokeDashoffset={-(cLen + iLen)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">{Math.round(cPct)}%</span>
                    <span className="text-[10px] text-gray-400">Done</span>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-900" /><span className="text-xs text-gray-500">Completed ({completed})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-400" /><span className="text-xs text-gray-500">In Progress ({inProgress})</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-gray-300" /><span className="text-xs text-gray-500">Pending ({pending})</span></div>
            </div>
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────
export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [ownersSummary, setOwnersSummary] = useState([]);
    const [customersSummary, setCustomersSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("dashboard");
    const [detail, setDetail] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    // Fetch notification count
    useEffect(() => {
        if (!user) return;
        const fetchNotifs = async () => {
            try {
                const res = await notificationAPI.getUnreadCount();
                setUnreadNotif(res.data?.data?.count || 0);
            } catch {}
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, ordersRes, txRes, ownersRes, customersRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getAllUsers(),
                orderAPI.getAll(),
                transactionAPI.getAll(),
                adminAPI.getOwnersSummary(),
                adminAPI.getCustomersSummary(),
            ]);
            setStats(statsRes.data?.data || statsRes.data);
            setUsers(usersRes.data?.data || []);
            setOrders(ordersRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
            setOwnersSummary(ownersRes.data?.data || []);
            setCustomersSummary(customersRes.data?.data || []);
        } catch { /* silent */ }
        setLoading(false);
    };

    const loadOwnerDetail = async (ownerId) => {
        setDetailLoading(true);
        try {
            const { data } = await adminAPI.getOwnerDetail(ownerId);
            setDetailData(data.data);
            setDetail({ type: "owner", id: ownerId });
        } catch (err) {
            toast.error("Failed to load owner details");
        }
        setDetailLoading(false);
    };

    const loadCustomerDetail = async (customerId) => {
        setDetailLoading(true);
        try {
            const { data } = await adminAPI.getCustomerDetail(customerId);
            setDetailData(data.data);
            setDetail({ type: "customer", id: customerId });
        } catch (err) {
            toast.error("Failed to load customer details");
        }
        setDetailLoading(false);
    };

    const handleApprove = async (id) => {
        try { await adminAPI.approveOwner(id); toast.success("Owner approved!"); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const handleReject = async (id) => {
        try { await adminAPI.rejectOwner(id); toast.success("Owner rejected"); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Delete this user?")) return;
        try { await adminAPI.deleteUser(id); toast.success("User deleted"); fetchData(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    if (loading) return <LoadingSpinner />;

    // Compute order status counts for donut
    const completedOrders = orders.filter(o => o.status === "delivered").length;
    const processingOrders = orders.filter(o => o.status === "processing" || o.status === "shipped").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    // Compute weekly sales for bar chart
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklySales = dayLabels.map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStart = new Date(d.setHours(0, 0, 0, 0));
        const dayEnd = new Date(d.setHours(23, 59, 59, 999));
        return orders
            .filter(o => {
                const created = new Date(o.createdAt);
                return created >= dayStart && created <= dayEnd && o.status !== "cancelled";
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    });

    const customers = users.filter(u => u.role === "user");
    const owners = users.filter(u => u.role === "owner");
    const pendingOwners = owners.filter(o => !o.isApproved);

    const filteredSearch = (items, fields) => {
        if (!searchQuery) return items;
        return items.filter(item =>
            fields.some(f => {
                const val = f.split(".").reduce((obj, key) => obj?.[key], item);
                return val?.toString().toLowerCase().includes(searchQuery.toLowerCase());
            })
        );
    };

    // ── Detail View ────────────────────────────────
    if (detail && detailData) {
        if (detail.type === "owner") {
            const { owner, stats: s, products, orders: ownerOrders, credits } = detailData;
            return (
                <div className="lg:ml-64 min-h-screen bg-gray-50/50">
                    <Sidebar tab={tab} setTab={setTab} setDetail={setDetail} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigate={navigate} unreadNotif={unreadNotif} />
                    <div className="p-4 lg:p-8">
                        <button onClick={() => { setDetail(null); setDetailData(null); }} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 transition-colors text-sm font-medium">
                            <FiArrowLeft size={16} /> Back to Shop Owners
                        </button>

                        {/* Owner Header */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 text-2xl font-bold">
                                    {owner.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{owner.companyName || owner.name}</h2>
                                    <p className="text-gray-500 text-sm">{owner.email} {owner.phone ? `• ${owner.phone}` : ""}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${owner.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {owner.isApproved ? "Approved" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <KPICard icon={<FiPackage size={18} />} label="Products" value={s.totalProducts} />
                            <KPICard icon={<FiShoppingCart size={18} />} label="Orders" value={s.totalOrders} />
                            <KPICard icon={<FiDollarSign size={18} />} label="Revenue" value={`₹${s.totalRevenue.toLocaleString("en-IN")}`} featured />
                            <KPICard icon={<FiCreditCard size={18} />} label="Outstanding Credit" value={`₹${s.totalOutstanding.toLocaleString("en-IN")}`} />
                        </div>

                        {/* Credit Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Total Credit Given</p>
                                <p className="text-xl font-bold text-gray-900">₹{s.totalCreditGiven.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Total Credit Paid</p>
                                <p className="text-xl font-bold text-emerald-600">₹{s.totalCreditPaid.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Credit Customers</p>
                                <p className="text-xl font-bold text-gray-900">{s.totalCustomers}</p>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="bg-white rounded-2xl border border-gray-100 mb-6 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Products ({products.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {products.length === 0 ? (
                                    <p className="p-5 text-gray-400 text-sm">No products yet.</p>
                                ) : products.map(p => (
                                    <div key={p._id} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">💎</div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.category || "Uncategorized"} • Stock: {p.stock}</p>
                                        </div>
                                        <PriceTag amount={p.price} className="text-sm font-semibold" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Credit Customers */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Credit Customers ({credits.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {credits.length === 0 ? (
                                    <p className="p-5 text-gray-400 text-sm">No credit customers.</p>
                                ) : credits.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">{c.user?.name}</p>
                                            <p className="text-xs text-gray-400">{c.user?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Outstanding</p>
                                            <p className={`font-bold ${c.balance > 0 ? "text-red-500" : "text-emerald-600"}`}>₹{c.balance.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (detail.type === "customer") {
            const { customer, stats: s, orders: custOrders, credits, transactions: custTx } = detailData;
            return (
                <div className="lg:ml-64 min-h-screen bg-gray-50/50">
                    <Sidebar tab={tab} setTab={setTab} setDetail={setDetail} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigate={navigate} unreadNotif={unreadNotif} />
                    <div className="p-4 lg:p-8">
                        <button onClick={() => { setDetail(null); setDetailData(null); }} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-6 transition-colors text-sm font-medium">
                            <FiArrowLeft size={16} /> Back to Customers
                        </button>

                        {/* Customer Header */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 text-2xl font-bold">
                                    {customer.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                                    <p className="text-gray-500 text-sm">{customer.email} {customer.phone ? `• ${customer.phone}` : ""}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <KPICard icon={<FiShoppingCart size={18} />} label="Orders" value={s.totalOrders} />
                            <KPICard icon={<FiDollarSign size={18} />} label="Total Spent" value={`₹${s.totalSpent.toLocaleString("en-IN")}`} featured />
                            <KPICard icon={<FiCreditCard size={18} />} label="Credit Used" value={`₹${s.totalCreditUsed.toLocaleString("en-IN")}`} />
                            <KPICard icon={<FiTrendingUp size={18} />} label="Outstanding" value={`₹${s.totalOutstanding.toLocaleString("en-IN")}`} />
                        </div>

                        {/* Credit Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Credit Paid</p>
                                <p className="text-xl font-bold text-emerald-600">₹{s.totalCreditPaid.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Credit Remaining</p>
                                <p className="text-xl font-bold text-red-500">₹{s.totalOutstanding.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Shops Using Credit</p>
                                <p className="text-xl font-bold text-gray-900">{s.totalShops}</p>
                            </div>
                        </div>

                        {/* Orders */}
                        <div className="bg-white rounded-2xl border border-gray-100 mb-6 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Orders ({custOrders.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {custOrders.length === 0 ? (
                                    <p className="p-5 text-gray-400 text-sm">No orders yet.</p>
                                ) : custOrders.slice(0, 10).map(o => {
                                    const shopOwner = o.items?.[0]?.product?.owner;
                                    return (
                                    <div key={o._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">#{o._id?.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400">{shopOwner?.companyName || shopOwner?.name || "Shop"} • {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={o.status} />
                                            <PriceTag amount={o.totalAmount} className="text-sm font-semibold" />
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Credit Ledgers */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-800">Credit Ledgers ({credits.length})</h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {credits.length === 0 ? (
                                    <p className="p-5 text-gray-400 text-sm">No credit history.</p>
                                ) : credits.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-800">{c.owner?.companyName || c.owner?.name}</p>
                                            <p className="text-xs text-gray-400">{c.entries?.length || 0} entries</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Outstanding</p>
                                            <p className={`font-bold ${c.balance > 0 ? "text-red-500" : "text-emerald-600"}`}>₹{c.balance.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // ── Main Dashboard View ────────────────────────
    return (
        <div className="lg:ml-64 min-h-screen bg-gray-50/50">
            <Sidebar tab={tab} setTab={setTab} setDetail={setDetail} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} navigate={navigate} unreadNotif={unreadNotif} />

            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                            <FiMenu size={22} />
                        </button>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder={`Search ${tab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setSearchQuery("");
                                }}
                                className="pl-9 pr-16 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-gray-200 w-64 transition-all"
                            />
                            {searchQuery ? (
                                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <FiX size={14} />
                                </button>
                            ) : (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">⌘F</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/notifications")} className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                            <FiBell size={18} />
                            {unreadNotif > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadNotif > 9 ? "9+" : unreadNotif}
                                </span>
                            )}
                        </button>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-xl py-1.5 pr-2 transition-colors">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm font-bold overflow-hidden ring-2 ring-emerald-200">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                    <p className="text-[11px] text-gray-400">{user?.email}</p>
                                </div>
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-400">{user?.email}</p>
                                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full uppercase">Admin</span>
                                    </div>
                                    <button
                                        onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiUser size={15} /> My Profile
                                    </button>
                                    <button
                                        onClick={() => { setProfileOpen(false); navigate("/notifications"); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiBell size={15} /> Notifications
                                        {unreadNotif > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>}
                                    </button>
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={() => { setProfileOpen(false); logout(); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut size={15} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 lg:p-8">
                {/* ── DASHBOARD TAB ─────────────────── */}
                {tab === "dashboard" && stats && (
                    <>
                        {/* Page Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name} — Here's your platform overview</p>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <KPICard icon={<FiUsers size={18} />} label="Total Users" value={customers.length} trend="+12% from last month" />
                            <KPICard icon={<FiBox size={18} />} label="Shop Owners" value={owners.length} trend={`${pendingOwners.length} pending`} />
                            <KPICard icon={<FiDollarSign size={18} />} label="Total Sales" value={`₹${(stats.totalSalesAmount || 0).toLocaleString("en-IN")}`} featured />
                            <KPICard icon={<FiCreditCard size={18} />} label="Outstanding Credit" value={`₹${(stats.totalOutstandingCredit || 0).toLocaleString("en-IN")}`} />
                        </div>

                        {/* Middle Row: Analytics + Reminders + Project List */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Bar Chart */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Sales Analytics</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Weekly revenue overview</p>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        ₹{weeklySales.reduce((a, b) => a + b, 0).toLocaleString("en-IN")} this week
                                    </span>
                                </div>
                                <MiniBarChart data={weeklySales} labels={dayLabels} />
                            </div>

                            {/* Reminders / Pending Approvals */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Pending Approvals</h3>
                                {pendingOwners.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No pending requests</p>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingOwners.slice(0, 4).map(o => (
                                            <div key={o._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-700 text-xs font-bold flex-shrink-0">
                                                        {o.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{o.name}</p>
                                                        <p className="text-[11px] text-gray-400 truncate">{o.companyName || o.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5 flex-shrink-0">
                                                    <button onClick={() => handleApprove(o._id)} className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                                        <FiCheck size={12} />
                                                    </button>
                                                    <button onClick={() => handleReject(o._id)} className="w-7 h-7 bg-red-100 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors">
                                                        <FiX size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Users */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {(stats.recentUsers || []).slice(0, 5).map(u => (
                                        <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate">{u.name}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Progress */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Order Progress</h3>
                                <DonutChart completed={completedOrders} inProgress={processingOrders} pending={pendingOrders} />
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                                <div className="space-y-3">
                                    {(stats.recentTransactions || []).slice(0, 5).map(tx => (
                                        <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">{tx.note || "Transaction"}</p>
                                                <p className="text-[11px] text-gray-400">{tx.user?.name || "Unknown"}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-gray-800">₹{tx.amount?.toLocaleString("en-IN")}</p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tx.type === "payment" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>{tx.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── OWNERS TAB ───────────────────── */}
                {tab === "owners" && (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shop Owners</h1>
                                <p className="text-gray-400 text-sm mt-1">{owners.length} registered shops</p>
                            </div>
                            {pendingOwners.length > 0 && (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    {pendingOwners.length} pending approval
                                </span>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-left">
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Shop Owner</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Credit Given</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSearch(ownersSummary, ["name", "email", "companyName"]).length === 0 ? (
                                            <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No owners found</td></tr>
                                        ) : filteredSearch(ownersSummary, ["name", "email", "companyName"]).map(o => (
                                            <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => loadOwnerDetail(o._id)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 text-sm font-bold flex-shrink-0">
                                                            {o.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{o.companyName || o.name}</p>
                                                            <p className="text-[11px] text-gray-400">{o.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${o.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                        {o.isApproved ? "Approved" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{o.productCount}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">₹{o.revenue.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">₹{o.creditGiven.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-semibold ${o.outstanding > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                                        ₹{o.outstanding.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {!o.isApproved && (
                                                            <button onClick={() => handleApprove(o._id)} className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors" title="Approve">
                                                                <FiCheck size={12} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => loadOwnerDetail(o._id)} className="w-7 h-7 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors" title="View Details">
                                                            <FiEye size={12} />
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(o._id)} className="w-7 h-7 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors" title="Delete">
                                                            <FiTrash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── CUSTOMERS TAB ────────────────── */}
                {tab === "customers" && (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                            <p className="text-gray-400 text-sm mt-1">{customers.length} registered customers</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-left">
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Credit Used</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Credit Paid</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSearch(customersSummary, ["name", "email", "phone"]).length === 0 ? (
                                            <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No customers found</td></tr>
                                        ) : filteredSearch(customersSummary, ["name", "email", "phone"]).map(c => (
                                            <tr key={c._id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => loadCustomerDetail(c._id)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                                                            {c.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{c.name}</p>
                                                            <p className="text-[11px] text-gray-400">{c.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{c.orderCount}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">₹{c.creditUsed.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4 text-sm text-emerald-600 font-medium">₹{c.creditPaid.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-semibold ${c.outstanding > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                                        ₹{c.outstanding.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── ORDERS TAB ───────────────────── */}
                {tab === "orders" && (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                            <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-left">
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSearch(orders, ["_id", "user.name"]).length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders found</td></tr>
                                        ) : filteredSearch(orders, ["_id", "user.name"]).map(o => (
                                            <tr key={o._id} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm text-gray-500">#{o._id?.slice(-8).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-sm">{o.user?.name || "—"}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{o.items?.length || 0}</td>
                                                <td className="px-6 py-4"><PriceTag amount={o.totalAmount} /></td>
                                                <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── TRANSACTIONS TAB ─────────────── */}
                {tab === "transactions" && (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                            <p className="text-gray-400 text-sm mt-1">{transactions.length} total transactions</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-left">
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                                            <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSearch(transactions, ["_id", "user.name", "note"]).length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No transactions found</td></tr>
                                        ) : filteredSearch(transactions, ["_id", "user.name", "note"]).map(tx => (
                                            <tr key={tx._id} className="hover:bg-emerald-50/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm text-gray-500">#{tx._id?.slice(-8).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-sm">{tx.user?.name || "—"}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${tx.type === "payment" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>{tx.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">₹{tx.amount?.toLocaleString("en-IN")}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{tx.note}</td>
                                                <td className="px-6 py-4 text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
