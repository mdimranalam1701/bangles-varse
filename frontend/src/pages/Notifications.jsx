import { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { notificationAPI } from "../services/api";
import { LoadingSpinner, EmptyState } from "../components/UI";

export default function Notifications() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const { data } = await notificationAPI.get();
            setItems(data.data || []);
        } catch {
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-serif font-bold text-ink">Notifications</h1>
                {items.some((n) => !n.isread) && (
                    <button
                        type="button"
                        onClick={async () => {
                            await notificationAPI.markAllRead();
                            toast.success("All marked read");
                            load();
                        }}
                        className="btn-secondary !py-2 text-xs"
                    >
                        <CheckCheck size={15} /> Mark all read
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <EmptyState icon={Bell} title="All caught up" description="Order confirmations and shop updates appear here." />
            ) : (
                <div className="space-y-3">
                    {items.map((n) => (
                        <div key={n._id} className={`card p-4 flex items-start justify-between gap-3 ${!n.isread ? "border-sindoor-300 bg-sindoor-50/30" : ""}`}>
                            <div>
                                <p className="font-semibold text-sm text-ink">{n.title}</p>
                                <p className="text-xs text-umber mt-0.5">{n.message}</p>
                                <p className="text-[11px] text-umber/60 mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    await notificationAPI.delete(n._id);
                                    load();
                                }}
                                className="text-umber/60 hover:text-red-600 p-1"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
