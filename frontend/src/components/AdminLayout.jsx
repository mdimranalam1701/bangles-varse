import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiUsers, FiShoppingCart, FiDollarSign, FiPackage, FiHome, FiCreditCard,
    FiBox, FiSearch, FiBell, FiMenu, FiX, FiLogOut, FiUser, FiSettings
} from "react-icons/fi";
import { notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const menuItems = [
        { key: "/admin/dashboard", icon: <FiHome size={18} />, label: "Dashboard" },
        { key: "/admin/owners", icon: <FiBox size={18} />, label: "Shop Owners" },
        { key: "/admin/customers", icon: <FiUsers size={18} />, label: "Customers" },
        { key: "/admin/orders", icon: <FiShoppingCart size={18} />, label: "Orders" },
        { key: "/admin/transactions", icon: <FiDollarSign size={18} />, label: "Transactions" },
    ];

    const currentPath = location.pathname;

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

    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="lg:ml-64 min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                <div className="p-6 border-b border-gray-100">
                    <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <FiBox size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Bangles Verse</span>
                    </button>
                </div>

                <nav className="flex-1 p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <div className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.key}
                                onClick={() => { navigate(item.key); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    currentPath === item.key || (item.key === "/admin/dashboard" && currentPath.startsWith("/admin/dashboard"))
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                            >
                                {(currentPath === item.key || (item.key === "/admin/dashboard" && currentPath.startsWith("/admin/dashboard"))) && (
                                    <div className="w-1 h-6 bg-emerald-500 rounded-r-full -ml-3 mr-1" />
                                )}
                                <span className={currentPath === item.key ? "text-emerald-600" : ""}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6 px-3">General</p>
                    <div className="space-y-1">
                        <button
                            onClick={() => { navigate("/notifications"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPath === "/notifications" ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                        >
                            {currentPath === "/notifications" && <div className="w-1 h-6 bg-emerald-500 rounded-r-full -ml-3 mr-1" />}
                            <FiBell size={18} />
                            Notifications
                            {unreadNotif > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPath === "/profile" ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                        >
                            {currentPath === "/profile" && <div className="w-1 h-6 bg-emerald-500 rounded-r-full -ml-3 mr-1" />}
                            <FiSettings size={18} />
                            Settings
                        </button>
                    </div>
                </nav>

                <div className="p-4">
                    <div className="bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full -translate-y-8 translate-x-8 blur-2xl" />
                        <p className="text-white text-sm font-semibold mb-1">Admin Panel</p>
                        <p className="text-gray-400 text-xs mb-3">Manage your platform</p>
                        <div className="w-8 h-1 bg-emerald-400 rounded-full" />
                    </div>
                </div>
            </aside>

            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                            <FiMenu size={22} />
                        </button>
                        <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 lg:hidden">
                            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <FiBox size={14} className="text-white" />
                            </div>
                            <span className="font-bold text-gray-900">Bangles Verse</span>
                        </button>
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
                                    <button onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        <FiUser size={15} /> My Profile
                                    </button>
                                    <button onClick={() => { setProfileOpen(false); navigate("/notifications"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                        <FiBell size={15} /> Notifications
                                        {unreadNotif > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>}
                                    </button>
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
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
                {children}
            </main>
        </div>
    );
}
