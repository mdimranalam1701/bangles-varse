import { useState, useEffect } from "react";
import {
    FiUsers, FiUserCheck, FiUserX, FiShoppingCart, FiDollarSign,
    FiPackage, FiTrash2, FiCheck, FiX
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminAPI, orderAPI, transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("overview");
    const [userFilter, setUserFilter] = useState("all");
    const [searchUsers, setSearchUsers] = useState("");
    const [searchOrders, setSearchOrders] = useState("");
    const [searchTx, setSearchTx] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, ordersRes, txRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getAllUsers(),
                orderAPI.getAll(),
                transactionAPI.getAll(),
            ]);
            setStats(statsRes.data?.data || statsRes.data);
            setUsers(usersRes.data?.data || []);
            setOrders(ordersRes.data?.data || []);
            setTransactions(txRes.data?.data || []);
        } catch {
            // silent
        }
        setLoading(false);
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

    const customers = users.filter(u => u.role === "user");
    const owners = users.filter(u => u.role === "owner");
    const pendingOwners = owners.filter(o => !o.isApproved);

    let filteredUsers = userFilter === "all" ? users
        : userFilter === "customers" ? customers
            : userFilter === "owners" ? owners
                : userFilter === "pending" ? pendingOwners : users;

    if (searchUsers) {
        filteredUsers = filteredUsers.filter(u => 
            u.name?.toLowerCase().includes(searchUsers.toLowerCase()) || 
            u.email?.toLowerCase().includes(searchUsers.toLowerCase())
        );
    }

    const filteredOrders = orders.filter(o => 
        o._id?.toLowerCase().includes(searchOrders.toLowerCase()) || 
        o.user?.name?.toLowerCase().includes(searchOrders.toLowerCase())
    );

    const filteredTx = transactions.filter(tx => 
        tx._id?.toLowerCase().includes(searchTx.toLowerCase()) || 
        tx.user?.name?.toLowerCase().includes(searchTx.toLowerCase()) ||
        tx.note?.toLowerCase().includes(searchTx.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome, {user?.name} — Full site control</p>
            </div>

            {/* Platform Metrics */}
            <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: <FiUsers />, label: "Total Users", value: stats?.totalUsers || 0, color: "text-blue-600", bg: "bg-blue-100" },
                    { icon: <FiUserCheck />, label: "Approved Owners", value: stats?.approvedOwners || 0, color: "text-green-600", bg: "bg-green-100" },
                    { icon: <FiPackage />, label: "Total Products", value: stats?.totalProducts || 0, color: "text-purple-600", bg: "bg-purple-100" },
                    { icon: <FiShoppingCart />, label: "Total Orders", value: stats?.totalOrders || 0, color: "text-orange-600", bg: "bg-orange-100" },
                ].map((s, i) => (
                    <div key={i} className="card p-5 border-l-4 border-transparent hover:border-gold-400 transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className="text-sm text-gray-400">{s.label}</p>
                                <p className="text-xl font-bold text-gray-800">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Financial Metrics */}
            <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">Financial Insights (Global)</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: <FiDollarSign />, label: "Total Platform Sales", value: stats?.totalSalesAmount || 0, isMoney: true },
                    { icon: <FiDollarSign />, label: "Global Outstanding Credit", value: stats?.totalOutstandingCredit || 0, isMoney: true },
                    { icon: <FiDollarSign />, label: "Total Credit Payments", value: stats?.totalPaymentsReceived || 0, isMoney: true },
                ].map((s, i) => (
                    <div key={i} className="card p-6 bg-gradient-to-br from-white to-gold-50/30 border border-gold-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gold-100 text-gold-600 text-xl">{s.icon}</div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                                <PriceTag amount={s.value} className="text-2xl font-bold text-gray-900" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Approvals */}
            {pendingOwners.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8">
                    <h3 className="font-semibold text-yellow-800 flex items-center gap-2 mb-3">
                        ⚠️ {pendingOwners.length} Owner{pendingOwners.length > 1 ? "s" : ""} Pending Approval
                    </h3>
                    <div className="space-y-3">
                        {pendingOwners.map(o => (
                            <div key={o._id} className="flex items-center justify-between bg-white rounded-xl p-3">
                                <div>
                                    <p className="font-medium text-gray-800">{o.name}</p>
                                    <p className="text-sm text-gray-400">{o.email}{o.companyName ? ` • ${o.companyName}` : ""}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(o._id)} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600">
                                        <FiCheck size={14} /> Approve
                                    </button>
                                    <button onClick={() => handleReject(o._id)} className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
                                        <FiX size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
                {["overview", "users", "orders", "transactions"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-gold-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === "overview" && stats && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="card p-5">
                        <h3 className="font-serif font-semibold mb-4">Recent Users</h3>
                        <div className="space-y-3">
                            {(stats.recentUsers || []).slice(0, 5).map(u => (
                                <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 text-sm font-bold">{u.name?.[0]?.toUpperCase()}</div>
                                        <div className="max-w-[120px] sm:max-w-full">
                                            <p className="text-sm font-medium text-gray-700 truncate">{u.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${u.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card p-5">
                        <h3 className="font-serif font-semibold mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                            {(stats.recentOrders || []).slice(0, 5).map(o => (
                                <div key={o._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{o.user?.name || "User"}</p>
                                        <p className="text-xs text-gray-400">#{o._id?.slice(-8)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={o.status} />
                                        <PriceTag amount={o.totalAmount} className="text-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card p-5">
                        <h3 className="font-serif font-semibold mb-4">Recent Transactions</h3>
                        <div className="space-y-3">
                            {(stats.recentTransactions || []).slice(0, 5).map(tx => (
                                <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{tx.note || "Transaction"}</p>
                                        <p className="text-xs text-gray-400">{tx.user?.name || "Unknown"}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <PriceTag amount={tx.amount} className="text-sm font-bold" />
                                        <StatusBadge status={tx.type} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: "all", label: `All (${users.length})` },
                                { key: "customers", label: `Customers (${customers.length})` },
                                { key: "owners", label: `Owners (${owners.length})` },
                                { key: "pending", label: `Pending (${pendingOwners.length})` },
                            ].map(f => (
                                <button key={f.key} onClick={() => setUserFilter(f.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${userFilter === f.key ? "bg-gold-500 text-white" : "bg-white text-gray-600 border hover:border-gold-300"}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..." 
                            value={searchUsers}
                            onChange={(e) => setSearchUsers(e.target.value)}
                            className="input-field max-w-xs"
                        />
                    </div>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead><tr className="bg-gray-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Company</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr></thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="hover:bg-gold-50/50 transition-colors">
                                            <td className="px-6 py-4"><div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 text-sm font-bold">{u.name?.[0]?.toUpperCase()}</div>
                                                <div><p className="font-medium text-gray-800">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                                            </div></td>
                                            <td className="px-6 py-4"><span className={`badge ${u.role === "admin" ? "bg-red-100 text-red-700" : u.role === "owner" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                                            <td className="px-6 py-4">{u.role === "owner" ? <span className={`badge ${u.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{u.isApproved ? "Approved" : "Pending"}</span> : <span className="badge bg-green-100 text-green-700">Active</span>}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{u.companyName || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                                            <td className="px-6 py-4"><div className="flex items-center gap-2">
                                                {u.role === "owner" && !u.isApproved && <button onClick={() => handleApprove(u._id)} className="text-green-500 hover:text-green-700"><FiCheck size={16} /></button>}
                                                {u.role === "owner" && u.isApproved && <button onClick={() => handleReject(u._id)} className="text-yellow-500 hover:text-yellow-700"><FiX size={16} /></button>}
                                                {u.role !== "admin" && <button onClick={() => handleDeleteUser(u._id)} className="text-gray-300 hover:text-red-500"><FiTrash2 size={16} /></button>}
                                            </div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders */}
            {tab === "orders" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <input 
                            type="text" 
                            placeholder="Search orders by ID or Customer..." 
                            value={searchOrders}
                            onChange={(e) => setSearchOrders(e.target.value)}
                            className="input-field max-w-sm"
                        />
                    </div>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders found</td></tr>
                                    : filteredOrders.map(o => (
                                        <tr key={o._id} className="hover:bg-gold-50/50 transition-colors">
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
            </div>
            )}

            {/* Transactions */}
            {tab === "transactions" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            value={searchTx}
                            onChange={(e) => setSearchTx(e.target.value)}
                            className="input-field max-w-sm"
                        />
                    </div>
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Note</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTx.length === 0 ? <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No transactions found</td></tr>
                                    : filteredTx.map(tx => (
                                        <tr key={tx._id} className="hover:bg-gold-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-500">#{tx._id?.slice(-8).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm">{tx.user?.name || "—"}</td>
                                            <td className="px-6 py-4"><StatusBadge status={tx.type} /></td>
                                            <td className="px-6 py-4"><PriceTag amount={tx.amount} /></td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{tx.note}</td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
