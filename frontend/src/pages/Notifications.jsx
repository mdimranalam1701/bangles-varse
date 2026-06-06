import { useState, useEffect } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiPackage, FiDollarSign, FiUser, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { notificationAPI } from "../services/api";
import { LoadingSpinner, EmptyState } from "../components/UI";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await notificationAPI.get();
            setNotifications(data.data || []);
        } catch {
            setNotifications([]);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isread: true } : n))
            );
        } catch {
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
            toast.success("All marked as read");
        } catch {
            toast.error("Failed");
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch {
            toast.error("Failed to delete");
        }
    };

    const getIcon = (title) => {
        if (title?.includes("Order") || title?.includes("📦") || title?.includes("🚚")) return <FiPackage size={18} />;
        if (title?.includes("Payment") || title?.includes("💰") || title?.includes("₹")) return <FiDollarSign size={18} />;
        if (title?.includes("Approved") || title?.includes("🎉")) return <FiCheckCircle size={18} />;
        if (title?.includes("Review") || title?.includes("⭐")) return <FiStar size={18} />;
        return <FiBell size={18} />;
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    if (loading) return <LoadingSpinner />;

    const unreadCount = notifications.filter((n) => !n.isread).length;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
                        <FiBell className="text-gold-500" /> Notifications
                        {unreadCount > 0 && (
                            <span className="bg-gold-500 text-white text-sm px-3 py-1 rounded-full font-bold">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="text-gray-400 mt-1">Stay updated with your activity</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1.5"
                    >
                        <FiCheck size={14} /> Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <EmptyState
                    icon="🔔"
                    title="No notifications yet"
                    description="You'll see notifications here when there's activity on your account."
                />
            ) : (
                <div className="space-y-3 stagger-children">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`card p-4 flex items-start gap-4 group transition-all duration-200 ${
                                !n.isread ? "!border-l-4 !border-l-gold-500 bg-gold-50/30" : ""
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                !n.isread ? "bg-gold-100 text-gold-600" : "bg-gray-100 text-gray-400"
                            }`}>
                                {getIcon(n.title)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className={`font-semibold ${!n.isread ? "text-gray-900" : "text-gray-600"}`}>
                                        {n.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                        {getTimeAgo(n.createdAt)}
                                    </span>
                                </div>
                                <p className={`text-sm mt-1 ${!n.isread ? "text-gray-600" : "text-gray-400"}`}>
                                    {n.message}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!n.isread && (
                                    <button
                                        onClick={() => handleMarkAsRead(n._id)}
                                        className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <FiCheck size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(n._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
