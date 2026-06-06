import { useState, useEffect, useRef } from "react";
import { FiDownload, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { creditAPI } from "../services/api";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CreditHistory() {
    const navigate = useNavigate();
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payModal, setPayModal] = useState(null);
    const [payForm, setPayForm] = useState({ amount: "", transactionId: "", entryId: null, method: "upi" });
    const pdfRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await creditAPI.getCustomerAll();
            setLedgers(data.data || []);
        } catch (err) {
            toast.error("Failed to fetch credit history");
        }
        setLoading(false);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!payModal) return;
        try {
            await creditAPI.customerPay({
                ownerId: payModal.owner._id,
                amount: Number(payForm.amount),
                transactionId: payForm.method === "upi" ? payForm.transactionId : `Cash payment`,
                entryId: payForm.entryId || undefined,
                paymentMethod: payForm.method
            });
            toast.success("Payment recorded successfully!");
            setPayModal(null);
            setPayForm({ amount: "", transactionId: "", entryId: null, method: "upi" });
            fetchData(); // Refresh ledgers
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to process payment");
        }
    };

    const downloadPDF = async (ledgerId, shopName) => {
        const element = document.getElementById(`ledger-${ledgerId}`);
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Credit_History_${shopName.replace(/\s+/g, '_')}.pdf`);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gold-600 mb-6 transition-colors"
            >
                <FiArrowLeft /> Back
            </button>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Credit History</h1>

            {ledgers.length === 0 ? (
                <div className="card p-10 text-center">
                    <p className="text-gray-400 text-lg">You have no credit history.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {ledgers.map((ledger) => (
                        <div key={ledger._id} className="card p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-serif font-bold text-gray-800">
                                        Shop: {ledger.owner?.companyName || ledger.owner?.name || "Unknown"}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Outstanding Balance: <span className="font-semibold text-red-500">₹{ledger.balance.toLocaleString("en-IN")}</span></p>
                                </div>
                                <div className="flex gap-3">
                                    {ledger.balance > 0 && (
                                        <button 
                                            onClick={() => setPayModal({ ...ledger, amount: ledger.balance })} 
                                            className="btn-primary flex items-center gap-2 text-sm"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => downloadPDF(ledger._id, ledger.owner?.companyName || ledger.owner?.name || "Shop")} 
                                        className="btn-secondary flex items-center gap-2 text-sm"
                                    >
                                        <FiDownload size={16} /> Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Ledger Table for PDF */}
                            <div id={`ledger-${ledger._id}`} className="bg-white p-4 rounded-xl border border-gray-100">
                                <h4 className="font-semibold text-gray-700 mb-4 hidden print:block text-center">
                                    Credit Statement - {ledger.owner?.companyName || ledger.owner?.name}
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100 text-gray-500">
                                                <th className="pb-3 font-medium">Date</th>
                                                <th className="pb-3 font-medium">Type</th>
                                                <th className="pb-3 font-medium">Method/Note</th>
                                                <th className="pb-3 font-medium text-right">Amount</th>
                                                <th className="pb-3 font-medium text-center print:hidden">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ledger.entries.map((entry, idx) => (
                                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                                    <td className="py-3 text-gray-600">
                                                        {new Date(entry.date).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td className="py-3">
                                                        <StatusBadge status={entry.type} />
                                                    </td>
                                                    <td className="py-3 text-gray-500">
                                                        {entry.type === "payment" 
                                                            ? `Paid via ${entry.paymentMethod?.toUpperCase() || "CASH"}` 
                                                            : entry.status === "paid" ? "Credit Purchase (Paid)" : "Credit Purchase"}
                                                    </td>
                                                    <td className="py-3 text-right font-medium">
                                                        <span className={entry.type === "payment" ? "text-green-600" : "text-red-500"}>
                                                            {entry.type === "payment" ? "-" : "+"}₹{entry.amount.toLocaleString("en-IN")}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-center print:hidden">
                                                        {entry.type === "credit" && entry.status === "pending" ? (
                                                            <button 
                                                                onClick={() => {
                                                                    setPayModal({ ...ledger, balance: entry.amount });
                                                                    setPayForm({ amount: entry.amount, transactionId: "", entryId: entry._id });
                                                                }}
                                                                className="text-xs bg-green-500 text-white hover:bg-green-600 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
                                                            >
                                                                Pay
                                                            </button>
                                                        ) : entry.type === "credit" && entry.status === "paid" ? (
                                                            <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-100 font-semibold text-gray-800 bg-gray-50">
                                                <td colSpan="4" className="py-3 px-2 text-right">Final Balance</td>
                                                <td className="py-3 text-right">₹{ledger.balance.toLocaleString("en-IN")}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Modal */}
            {payModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in shadow-2xl">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-serif font-semibold text-gray-900">Record Payment</h3>
                            <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            {/* Payment Method Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPayForm({ ...payForm, method: "upi" })}
                                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                            payForm.method === "upi" 
                                                ? "border-gold-500 bg-gold-50 text-gold-700" 
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        💳 UPI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPayForm({ ...payForm, method: "cash" })}
                                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                                            payForm.method === "cash" 
                                                ? "border-gold-500 bg-gold-50 text-gold-700" 
                                                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        💵 Cash
                                    </button>
                                </div>
                            </div>

                            {/* UPI Details - only shown when UPI is selected */}
                            {payForm.method === "upi" && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-sm text-blue-800 mb-2 font-medium">Send payment to:</p>
                                    <p className="text-xl font-mono font-bold text-blue-900 break-all bg-white p-3 rounded-lg border border-blue-200 text-center">
                                        {payModal.owner?.upiId || "UPI ID not provided by shop"}
                                    </p>
                                    {!payModal.owner?.upiId && (
                                        <p className="text-xs text-red-500 mt-2 text-center">Contact shop owner for their UPI ID</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={payForm.amount}
                                    onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                    className="input-field"
                                    placeholder="Enter amount"
                                    min="1"
                                    max={payModal.balance}
                                />
                                <p className="text-xs text-gray-500 mt-1">Outstanding Balance: ₹{payModal.balance}</p>
                            </div>

                            {/* Transaction ID - only for UPI */}
                            {payForm.method === "upi" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI Transaction / Reference ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={payForm.transactionId}
                                        onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g. 123456789012"
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="submit" 
                                    disabled={payForm.method === "upi" && !payModal.owner?.upiId} 
                                    className="btn-primary flex-1"
                                >
                                    Record Payment
                                </button>
                                <button type="button" onClick={() => setPayModal(null)} className="btn-secondary flex-1">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
