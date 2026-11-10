import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, ShoppingBag, DollarSign, Package, Trash2, Check, X } from "lucide-react";
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

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await adminAPI.approveOwner(id);
            toast.success("Shop approved!");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        }
    };

    const handleReject = async (id) => {
        try {
            await adminAPI.rejectOwner(id);
            toast.success("Shop approval revoked");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm("Delete this account?")) return;
        try {
            await adminAPI.deleteUser(id);
            toast.success("User deleted");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        }
    };

    if (loading) return <LoadingSpinner />;

    const owners = users.filter((u) => u.role === "owner");
    const pendingOwners = owners.filter((o) => !o.isApproved);
    const filteredUsers =
        userFilter === "all"
            ? users
            : userFilter === "customers"
                ? users.filter((u) => u.role === "user")
                : userFilter === "owners"
                    ? owners
                    : pendingOwners;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-ink">Platform Admin</h1>
                <p className="text-sm text-umber">Signed in as {user?.name}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { icon: DollarSign, label: "Platform GMV", value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}` },
                    { icon: Users, label: "Customers", value: stats?.totalUsers || 0 },
                    { icon: UserCheck, label: "Approved Shops", value: stats?.approvedOwners || 0 },
                    { icon: UserX, label: "Pending Approvals", value: stats?.pendingOwners || 0 },
                    { icon: Package, label: "Products", value: stats?.totalProducts || 0 },
                    { icon: ShoppingBag, label: "Orders", value: stats?.totalOrders || 0 },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card p-4 flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-linen text-sindoor-700 flex items-center justify-center shrink-0">
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-umber">{s.label}</p>
                                <p className="text-xl font-bold text-ink tabular-nums">{s.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {pendingOwners.length > 0 && (
                <div className="bg-brass-50 border border-brass-200 rounded-xl p-5 space-y-3">
                    <h2 className="font-serif font-bold text-lg text-ink">
                        Shops Awaiting Approval ({pendingOwners.length})
                    </h2>
                    <div className="space-y-2">
                        {pendingOwners.map((o) => (
                            <div key={o._id} className="bg-white rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 border border-parchment">
                                <div>
                                    <p className="font-semibold text-ink text-sm">{o.companyName || o.name}</p>
                                    <p className="text-xs text-umber">{o.name} • {o.phone || o.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleApprove(o._id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                                        <Check size={14} /> Approve
                                    </button>
                                    <button type="button" onClick={() => handleReject(o._id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                                        <X size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-1 bg-linen p-1 rounded-xl border border-parchment w-fit">
                {["overview", "users", "orders", "transactions"].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${
                            tab === t ? "bg-white text-sindoor-700 shadow-xs" : "text-umber hover:text-ink"
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "overview" && stats && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="card p-5 space-y-3">
                        <h3 className="font-serif font-bold text-xl text-ink">Recent Accounts</h3>
                        {(stats.recentUsers || []).slice(0, 6).map((u) => (
                            <div key={u._id} className="flex items-center justify-between py-2 border-b border-parchment/60 last:border-0 text-sm">
                                <div>
                                    <p className="font-semibold text-ink">{u.name}</p>
                                    <p className="text-xs text-umber">{u.phone || u.email}</p>
                                </div>
                                <span className="badge bg-linen text-ink capitalize">{u.role}</span>
                            </div>
                        ))}
                    </div>
                    <div className="card p-5 space-y-3">
                        <h3 className="font-serif font-bold text-xl text-ink">Recent Orders</h3>
                        {(stats.recentOrders || []).slice(0, 6).map((o) => (
                            <div key={o._id} className="flex items-center justify-between py-2 border-b border-parchment/60 last:border-0 text-sm">
                                <div>
                                    <p className="font-mono font-semibold text-sindoor-700">{o.orderCode || `#${o._id.slice(-6)}`}</p>
                                    <p className="text-xs text-umber">{o.customerName || o.user?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={o.status} />
                                    <PriceTag amount={o.totalAmount} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === "users" && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {["all", "customers", "owners", "pending"].map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setUserFilter(f)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border ${
                                    userFilter === f ? "bg-sindoor-600 text-white border-sindoor-600" : "bg-white text-ink border-parchment"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="card overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-linen text-xs uppercase text-umber">
                                <tr>
                                    <th className="px-5 py-3">User</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment/70">
                                {filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-ivory">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-ink">{u.name}</p>
                                            <p className="text-xs text-umber">{u.phone || u.email} {u.companyName ? `• ${u.companyName}` : ""}</p>
                                        </td>
                                        <td className="px-5 py-3 capitalize">{u.role}</td>
                                        <td className="px-5 py-3">
                                            {u.role === "owner" ? (
                                                <span className={`badge ${u.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-brass-50 text-brass-700"}`}>
                                                    {u.isApproved ? "Approved" : "Pending"}
                                                </span>
                                            ) : (
                                                <span className="badge bg-emerald-50 text-emerald-700">Active</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 flex items-center gap-2">
                                            {u.role === "owner" && !u.isApproved && (
                                                <button type="button" onClick={() => handleApprove(u._id)} className="text-emerald-600 hover:text-emerald-800" title="Approve">
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            {u.role === "owner" && u.isApproved && (
                                                <button type="button" onClick={() => handleReject(u._id)} className="text-brass-700 hover:text-ink" title="Revoke">
                                                    <X size={16} />
                                                </button>
                                            )}
                                            {u.role !== "admin" && (
                                                <button type="button" onClick={() => handleDeleteUser(u._id)} className="text-umber hover:text-red-600" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "orders" && (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-linen text-xs uppercase text-umber">
                            <tr>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parchment/70">
                            {orders.map((o) => (
                                <tr key={o._id}>
                                    <td className="px-5 py-3 font-mono font-semibold text-sindoor-700">{o.orderCode || o._id.slice(-6)}</td>
                                    <td className="px-5 py-3">{o.customerName || o.user?.name || "—"}</td>
                                    <td className="px-5 py-3"><PriceTag amount={o.totalAmount} /></td>
                                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                                    <td className="px-5 py-3 text-umber">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === "transactions" && (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-linen text-xs uppercase text-umber">
                            <tr>
                                <th className="px-5 py-3">User</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Amount</th>
                                <th className="px-5 py-3">Note</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parchment/70">
                            {transactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td className="px-5 py-3">{tx.user?.name || "—"}</td>
                                    <td className="px-5 py-3"><StatusBadge status={tx.type} /></td>
                                    <td className="px-5 py-3"><PriceTag amount={tx.amount} /></td>
                                    <td className="px-5 py-3 text-umber">{tx.note}</td>
                                    <td className="px-5 py-3 text-umber">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
