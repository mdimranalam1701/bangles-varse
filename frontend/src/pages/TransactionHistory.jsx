import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiDollarSign, FiCreditCard, FiTrendingUp, FiTrendingDown, FiCalendar, FiSearch, FiChevronRight, FiChevronDown, FiDownload, FiX, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/UI";
import OwnerLayout from "../components/OwnerLayout";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TransactionHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("overview"); // overview | shop | all
    const [selectedShop, setSelectedShop] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTx, setSelectedTx] = useState(null);
    const [expandedShop, setExpandedShop] = useState(null);

    const isOwner = user?.role === "owner";

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        try {
            const fn = isOwner ? transactionAPI.getOwnerTransactions : transactionAPI.getMy;
            const { data } = await fn();
            setTransactions(data.data || []);
        } catch { toast.error("Failed to load"); }
        setLoading(false);
    };

    const getTimeAgo = (date) => {
        const s = Math.floor((new Date() - new Date(date)) / 1000);
        if (s < 60) return "Just now";
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
        return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };
    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const formatTime = (date) => new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // ── Group transactions by shop/customer ─────────
    const grouped = {};
    transactions.forEach(tx => {
        const key = isOwner ? (tx.user?._id || "unknown") : (tx.owner?._id || "unknown");
        const name = isOwner ? (tx.user?.name || "Customer") : (tx.owner?.name || "Shop");
        if (!grouped[key]) grouped[key] = { id: key, name, transactions: [], creditTotal: 0, paymentTotal: 0 };
        grouped[key].transactions.push(tx);
        if (tx.type === "credit") grouped[key].creditTotal += tx.amount;
        else grouped[key].paymentTotal += tx.amount;
    });
    const shopList = Object.values(grouped).map(g => ({ ...g, balance: g.creditTotal - g.paymentTotal }));

    // ── Stats ───────────────────────────────────────
    const totalCredit = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const totalPayment = transactions.filter(t => t.type === "payment").reduce((s, t) => s + t.amount, 0);
    const totalBalance = totalCredit - totalPayment;

    // ── Recent (last 10) ────────────────────────────
    const recent = transactions.slice(0, 10);

    // ── Filtered for selected shop ──────────────────
    const shopTx = selectedShop ? shopList.find(s => s.id === selectedShop) : null;

    const filteredAll = searchQuery
        ? transactions.filter(tx => tx.note?.toLowerCase().includes(searchQuery.toLowerCase()) || (isOwner ? tx.user?.name : tx.owner?.name)?.toLowerCase().includes(searchQuery.toLowerCase()))
        : transactions;

    const downloadReceipt = async () => {
        const el = document.getElementById("tx-receipt");
        if (!el || !selectedTx) return;
        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const w = pdf.internal.pageSize.getWidth();
        const h = (canvas.height * w) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, w, h);
        pdf.save(`Receipt_${selectedTx._id?.slice(-8).toUpperCase()}.pdf`);
    };

    if (loading) return <LoadingSpinner />;

    const accent = isOwner
        ? { gradient: "from-purple-900 to-purple-800", text: "text-purple-700", bg: "bg-purple-50", btn: "bg-purple-600 hover:bg-purple-700", border: "border-purple-200", ring: "ring-purple-100", light: "text-purple-200", avatar: "from-purple-500 to-purple-700" }
        : { gradient: "from-amber-500 to-amber-600", text: "text-amber-700", bg: "bg-amber-50", btn: "bg-amber-600 hover:bg-amber-700", border: "border-amber-200", ring: "ring-amber-100", light: "text-amber-200", avatar: "from-amber-400 to-amber-600" };

    const content = (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6 transition-colors text-sm font-medium">
                <FiArrowLeft size={16} /> Back
            </button>

            {/* ── SHOP DETAIL VIEW ──────────────── */}
            {view === "shop" && shopTx ? (
                <>
                    <button onClick={() => { setView("overview"); setSelectedShop(null); }}
                        className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-4 transition-colors text-sm">
                        <FiArrowLeft size={14} /> Back to overview
                    </button>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${accent.avatar} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                                {shopTx.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{shopTx.name}</h2>
                                <p className="text-sm text-gray-400">{shopTx.transactions.length} transactions</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-5">
                            <div className="text-center p-3 bg-red-50 rounded-xl"><p className="text-xs text-gray-500">Credit Used</p><p className="font-bold text-red-500">₹{shopTx.creditTotal.toLocaleString("en-IN")}</p></div>
                            <div className="text-center p-3 bg-green-50 rounded-xl"><p className="text-xs text-gray-500">Paid</p><p className="font-bold text-green-600">₹{shopTx.paymentTotal.toLocaleString("en-IN")}</p></div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl"><p className="text-xs text-gray-500">Balance</p><p className={`font-bold ${shopTx.balance > 0 ? "text-red-500" : "text-green-600"}`}>₹{shopTx.balance.toLocaleString("en-IN")}</p></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {shopTx.transactions.map(tx => (
                            <button key={tx._id} onClick={() => setSelectedTx(tx)} className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all text-left">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                    {tx.type === "credit" ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{tx.note || (tx.type === "credit" ? "Credit Purchase" : "Payment")}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <FiCalendar size={10} /> {formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}
                                    </p>
                                </div>
                                <span className={`font-bold text-sm ${tx.type === "credit" ? "text-red-500" : "text-green-600"}`}>
                                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            ) : view === "all" ? (
                /* ── ALL TRANSACTIONS VIEW ───────── */
                <>
                    <button onClick={() => setView("overview")} className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-4 transition-colors text-sm">
                        <FiArrowLeft size={14} /> Back to overview
                    </button>
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold text-gray-900">All Transactions</h1><p className="text-gray-400 text-sm mt-1">{transactions.length} total</p></div>
                    </div>
                    <div className="relative mb-6">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div className="space-y-2">
                        {filteredAll.map(tx => (
                            <button key={tx._id} onClick={() => setSelectedTx(tx)} className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all text-left">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                    {tx.type === "credit" ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{tx.note || (tx.type === "credit" ? "Credit" : "Payment")}</p>
                                    <p className="text-xs text-gray-400">
                                        {isOwner ? tx.user?.name : tx.owner?.name} • <span className="inline-flex items-center gap-1"><FiCalendar size={10} />{formatDate(tx.createdAt)}</span>
                                    </p>
                                </div>
                                <span className={`font-bold text-sm ${tx.type === "credit" ? "text-red-500" : "text-green-600"}`}>
                                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                /* ── OVERVIEW (Default) ──────────── */
                <>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">{isOwner ? "Money Received" : "My Transactions"}</h1>
                        <p className="text-gray-400 text-sm mt-1">{isOwner ? "Track customer payments and credits" : "Track your spending and payments"}</p>
                    </div>

                    {/* Balance Card */}
                    <div className={`bg-gradient-to-br ${accent.gradient} rounded-2xl p-6 text-white relative overflow-hidden mb-6`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                        <div className="relative">
                            <p className={`${accent.light} text-sm mb-1`}>{isOwner ? "Total Outstanding" : "Total Balance"}</p>
                            <p className="text-3xl font-bold">₹{Math.abs(totalBalance).toLocaleString("en-IN")}</p>
                            <p className={`${accent.light} text-xs mt-1`}>{totalBalance > 0 ? (isOwner ? "You are owed" : "You owe across all shops") : "All clear! 🎉"}</p>
                        </div>
                        <div className="flex gap-6 mt-6">
                            <div><p className={`${accent.light} text-xs`}>{isOwner ? "Credit Given" : "Credit Used"}</p><p className="font-semibold text-lg">₹{totalCredit.toLocaleString("en-IN")}</p></div>
                            <div className="w-px bg-white/20" />
                            <div><p className={`${accent.light} text-xs`}>Payments</p><p className="font-semibold text-lg">₹{totalPayment.toLocaleString("en-IN")}</p></div>
                        </div>
                    </div>

                    {/* Shop/Customer Cards */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-800">{isOwner ? "By Customer" : "By Shop"}</h2>
                            <button onClick={() => setView("all")} className={`text-sm ${accent.text} font-medium hover:underline`}>View All →</button>
                        </div>
                        {shopList.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100"><FiDollarSign size={32} className="mx-auto mb-2 text-gray-300" /><p className="text-gray-400">No transactions yet</p></div>
                        ) : (
                            <div className="space-y-3">
                                {shopList.map(shop => (
                                    <div key={shop.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-200 transition-all">
                                        <button onClick={() => { setSelectedShop(shop.id); setView("shop"); }}
                                            className="w-full flex items-center gap-4 p-4 text-left">
                                            <div className={`w-11 h-11 bg-gradient-to-br ${accent.avatar} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                                {shop.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800">{shop.name}</p>
                                                <p className="text-xs text-gray-400">{shop.transactions.length} transactions</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`font-bold ${shop.balance > 0 ? "text-red-500" : "text-green-600"}`}>
                                                    ₹{Math.abs(shop.balance).toLocaleString("en-IN")}
                                                </p>
                                                <p className="text-[10px] text-gray-400">{shop.balance > 0 ? "Outstanding" : "Paid"}</p>
                                            </div>
                                            <FiChevronRight className="text-gray-300 flex-shrink-0" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    {recent.length > 0 && (
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-4">Recent Activity</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                                {recent.map(tx => (
                                    <button key={tx._id} onClick={() => setSelectedTx(tx)}
                                        className="w-full flex items-center gap-3 p-4 hover:bg-amber-50/30 transition-colors text-left">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                            {tx.type === "credit" ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{tx.note || (tx.type === "credit" ? "Credit" : "Payment")}</p>
                                            <p className="text-xs text-gray-400">
                                                {isOwner ? tx.user?.name : tx.owner?.name} • <FiCalendar size={10} className="inline" /> {formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}
                                            </p>
                                        </div>
                                        <span className={`font-bold text-sm ${tx.type === "credit" ? "text-red-500" : "text-green-600"}`}>
                                            {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── RECEIPT MODAL ─────────────────── */}
            {selectedTx && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTx(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div id="tx-receipt" className="p-6">
                            <div className="text-center mb-6">
                                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${selectedTx.type === "credit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}>
                                    {selectedTx.type === "credit" ? <FiTrendingUp size={24} /> : <FiTrendingDown size={24} />}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedTx.type === "credit" ? "Credit Purchase" : "Payment Made"}</h3>
                                <p className="text-gray-400 text-sm mt-1">#{selectedTx._id?.slice(-8).toUpperCase()}</p>
                            </div>
                            <p className={`text-3xl font-bold text-center mb-6 ${selectedTx.type === "credit" ? "text-red-500" : "text-green-600"}`}>
                                {selectedTx.type === "credit" ? "+" : "-"}₹{selectedTx.amount.toLocaleString("en-IN")}
                            </p>
                            <div className="space-y-2 bg-gray-50 rounded-xl p-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Date</span><span className="text-gray-800">{formatDate(selectedTx.createdAt)}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Time</span><span className="text-gray-800">{formatTime(selectedTx.createdAt)}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">{isOwner ? "Customer" : "Shop"}</span><span className="text-gray-800 font-medium">{isOwner ? selectedTx.user?.name : selectedTx.owner?.name || "N/A"}</span></div>
                                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Type</span><span className={`font-semibold ${selectedTx.type === "credit" ? "text-red-600" : "text-green-600"}`}>{selectedTx.type === "credit" ? "Credit" : "Payment"}</span></div>
                                <div className="flex justify-between py-2"><span className="text-gray-500">Note</span><span className="text-gray-800 text-right max-w-[200px]">{selectedTx.note || "—"}</span></div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-4 border-t border-gray-100">
                            <button onClick={downloadReceipt} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 ${accent.border} ${accent.text} rounded-xl font-medium hover:${accent.bg} transition-colors text-sm`}>
                                <FiDownload size={14} /> Receipt
                            </button>
                            <button onClick={() => setSelectedTx(null)} className={`flex-1 py-2.5 ${accent.btn} text-white rounded-xl font-medium transition-colors text-sm`}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isOwner) return <OwnerLayout>{content}</OwnerLayout>;
    return <div className="px-4 py-8">{content}</div>;
}
