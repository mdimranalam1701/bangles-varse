import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { transactionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

export default function TransactionHistory() {
    const { user } = useAuth();
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const req = user?.role === "owner" ? transactionAPI.getOwnerTransactions() : transactionAPI.getMy();
        req
            .then(({ data }) => setTxs(data.data || []))
            .catch(() => setTxs([]))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-ink">Transaction History</h1>
                <button type="button" onClick={() => window.print()} className="btn-secondary !py-2 text-xs">
                    <Printer size={15} /> Print
                </button>
            </div>
            <div className="space-y-3">
                {txs.length === 0 ? (
                    <p className="text-umber">No transactions yet.</p>
                ) : (
                    txs.map((tx) => (
                        <div key={tx._id} className="card p-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm text-ink">{tx.note || "Transaction"}</p>
                                <p className="text-xs text-umber">{new Date(tx.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={tx.type} />
                                <PriceTag amount={tx.amount} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
