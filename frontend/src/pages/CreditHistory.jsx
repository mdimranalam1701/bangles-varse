import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { creditAPI } from "../services/api";
import { LoadingSpinner, PriceTag } from "../components/UI";

export default function CreditHistory() {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        creditAPI
            .getMyAll()
            .then(({ data }) => setCredits(data.data || []))
            .catch(() => setCredits([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-ink">Khata Credit Statement</h1>
                <button type="button" onClick={() => window.print()} className="btn-secondary !py-2 text-xs">
                    <Printer size={15} /> Print Statement
                </button>
            </div>

            {credits.length === 0 ? (
                <p className="text-umber">No Khata ledger history yet.</p>
            ) : (
                credits.map((c) => (
                    <div key={c._id} className="card p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="font-serif font-bold text-xl text-ink">{c.owner?.companyName || c.owner?.name}</h2>
                            <PriceTag amount={c.balance} className="text-xl" />
                        </div>
                        <div className="divide-y divide-parchment/60 text-xs">
                            {(c.entries || []).map((e, i) => (
                                <div key={i} className="py-2 flex justify-between">
                                    <span>{e.note || e.type} • {new Date(e.date).toLocaleDateString("en-IN")}</span>
                                    <span className={e.type === "credit" ? "text-sindoor-700 font-bold" : "text-emerald-700 font-bold"}>
                                        {e.type === "credit" ? "+" : "-"}₹{e.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
