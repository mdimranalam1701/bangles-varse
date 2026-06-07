import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiPackage, FiShoppingCart, FiDollarSign, FiCreditCard, FiHome,
    FiBox, FiBell, FiMenu, FiX, FiLogOut, FiUser, FiSettings, FiGrid
} from "react-icons/fi";
import { notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OwnerLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const menuItems = [
        { key: "overview", icon: <FiHome size={18} />, label: "Dashboard" },
        { key: "products", icon: <FiPackage size={18} />, label: "Products" },
        { key: "orders", icon: <FiShoppingCart size={18} />, label: "Orders" },
        { key: "credit", icon: <FiCreditCard size={18} />, label: "Credits" },
    ];

    const currentPath = location.pathname;
    const goToTab = (tabKey) => {
        navigate(`/owner/dashboard?tab=${tabKey}`);
        setSidebarOpen(false);
    };

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
        <div className="lg:ml-64 min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-amber-50/20">
            {/* Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                <div className="absolute bottom-20 left-0 w-24 h-24 bg-amber-400/10 rounded-full translate-y-12 -translate-x-12 blur-2xl" />

                {/* Logo */}
                <div className="p-6 border-b border-purple-700/50 relative">
                    <button onClick={() => navigate("/owner/dashboard")} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                            <span className="text-lg">✨</span>
                        </div>
                        <div>
                            <span className="text-lg font-bold text-white tracking-tight">Bangles Verse</span>
                            <p className="text-[10px] text-purple-300 -mt-0.5">Shop Dashboard</p>
                        </div>
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 relative">
                    <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <div className="space-y-1">
                        {menuItems.map(item => {
                            const isActive = currentPath === "/owner/dashboard" && item.key === "overview";
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => goToTab(item.key)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-white/10 text-amber-300 shadow-lg shadow-purple-900/50"
                                            : "text-purple-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {isActive && <div className="w-1 h-6 bg-amber-400 rounded-r-full -ml-3 mr-1" />}
                                    <span className={isActive ? "text-amber-400" : ""}>{item.icon}</span>
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-3 mt-6 px-3">General</p>
                    <div className="space-y-1">
                        <button
                            onClick={() => { navigate("/notifications"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPath === "/notifications" ? "bg-white/10 text-amber-300" : "text-purple-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            {currentPath === "/notifications" && <div className="w-1 h-6 bg-amber-400 rounded-r-full -ml-3 mr-1" />}
                            <FiBell size={18} />
                            Notifications
                            {unreadNotif > 0 && (
                                <span className="ml-auto bg-amber-500 text-purple-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotif}</span>
                            )}
                        </button>
                        <button
                            onClick={() => { navigate("/transactions"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPath === "/transactions" ? "bg-white/10 text-amber-300" : "text-purple-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            {currentPath === "/transactions" && <div className="w-1 h-6 bg-amber-400 rounded-r-full -ml-3 mr-1" />}
                            <FiDollarSign size={18} />
                            Payment History
                        </button>
                        <button
                            onClick={() => { navigate("/profile"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                currentPath === "/profile" ? "bg-white/10 text-amber-300" : "text-purple-300 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            {currentPath === "/profile" && <div className="w-1 h-6 bg-amber-400 rounded-r-full -ml-3 mr-1" />}
                            <FiSettings size={18} />
                            Settings
                        </button>
                    </div>
                </nav>

                {/* Promo Card */}
                <div className="p-4 relative">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full -translate-y-6 translate-x-6 blur-xl" />
                        <p className="text-amber-300 text-sm font-semibold mb-1">✨ Premium</p>
                        <p className="text-purple-300 text-xs mb-3">Your shop is live</p>
                        <button onClick={() => navigate("/my-shop")} className="bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 text-xs font-bold py-2 px-4 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
                            View Shop
                        </button>
                    </div>
                </div>
            </aside>

            {/* Top Header */}
            <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-purple-100/50">
                <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-purple-700">
                            <FiMenu size={22} />
                        </button>
                        <button onClick={() => navigate("/owner/dashboard")} className="flex items-center gap-2 lg:hidden">
                            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                                <span className="text-sm">✨</span>
                            </div>
                            <span className="font-bold text-gray-900">Bangles Verse</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/chat")} className="relative p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors">
                            <FiGrid size={18} />
                        </button>
                        <button onClick={() => navigate("/notifications")} className="relative p-2.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors">
                            <FiBell size={18} />
                            {unreadNotif > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadNotif > 9 ? "9+" : unreadNotif}
                                </span>
                            )}
                        </button>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 pl-3 border-l border-purple-100 hover:bg-purple-50 rounded-xl py-1.5 pr-2 transition-colors">
                                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-purple-200">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                    <p className="text-[11px] text-purple-400">{user?.companyName || "Shop Owner"}</p>
                                </div>
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-400">{user?.email}</p>
                                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Shop Owner</span>
                                    </div>
                                    <button onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors">
                                        <FiUser size={15} /> My Profile
                                    </button>
                                    <button onClick={() => { setProfileOpen(false); navigate("/my-shop"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors">
                                        <FiBox size={15} /> My Shop
                                    </button>
                                    <button onClick={() => { setProfileOpen(false); navigate("/notifications"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 transition-colors">
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
