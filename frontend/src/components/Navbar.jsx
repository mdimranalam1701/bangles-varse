import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ShoppingBag,
    Menu,
    X,
    LogOut,
    Package,
    LayoutDashboard,
    Phone,
    Globe,
    Bell,
    Search,
    Ruler,
    Home as HomeIcon,
    Heart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LangContext";
import { notificationAPI } from "../services/api";
import { BrandMark } from "./UI";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { lang, toggleLang, t, isHindi, storeConfig, openSizeGuide } = useLang();
    const location = useLocation();

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        notificationAPI
            .get()
            .then(({ data }) => {
                setNotifications(data.data || []);
                setUnreadCount(data.unreadCount || 0);
            })
            .catch(() => {});
    }, [user, location.pathname]);

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    const isActive = (path) =>
        location.pathname === path ? "text-sindoor-700 font-semibold" : "text-ink/80 hover:text-sindoor-700";

    return (
        <>
            {/* Top Utility Bar: Help Phone + Free Delivery + 1-Tap Bilingual Switch */}
            <div className="bg-ink text-ivory text-xs py-2 px-4">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-ivory/85">{t("freeShipBanner")}</span>
                        <a
                            href={`tel:${storeConfig.supportPhone}`}
                            className="inline-flex items-center gap-1.5 text-brass-200 hover:text-white font-medium"
                        >
                            <Phone size={12} />
                            <span>{t("needHelpCall")}: {storeConfig.supportPhone}</span>
                        </a>
                    </div>

                    <button
                        type="button"
                        onClick={toggleLang}
                        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-ivory px-3 py-1 rounded-full font-semibold transition-colors"
                        aria-label="Switch language between English and Hindi"
                    >
                        <Globe size={13} />
                        <span>{lang === "en" ? "हिन्दी में देखें" : "Switch to English"}</span>
                    </button>
                </div>
            </div>

            {/* Main Sticky Header */}
            <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-parchment">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5">
                            <BrandMark className="w-8 h-8" />
                            <div>
                                <span className="text-xl sm:text-2xl font-serif font-bold text-ink tracking-tight block leading-none">
                                    {t("brand")}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-umber hidden sm:block">
                                    {t("tagline")}
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link to="/products" className={isActive("/products")}>
                                {t("navShop")}
                            </Link>
                            <Link to="/track-order" className={isActive("/track-order")}>
                                {t("navTrack")}
                            </Link>
                            <button
                                type="button"
                                onClick={openSizeGuide}
                                className="text-ink/80 hover:text-sindoor-700 inline-flex items-center gap-1"
                            >
                                <Ruler size={14} /> {t("navSizeGuide")}
                            </button>

                            {user?.role === "owner" && (
                                <Link to="/owner/dashboard" className={`${isActive("/owner/dashboard")} inline-flex items-center gap-1.5`}>
                                    <LayoutDashboard size={15} /> {t("navDashboard")}
                                </Link>
                            )}
                            {user?.role === "admin" && (
                                <Link to="/admin/dashboard" className={`${isActive("/admin/dashboard")} inline-flex items-center gap-1.5`}>
                                    <LayoutDashboard size={15} /> {t("navAdmin")}
                                </Link>
                            )}
                            {user?.role === "user" && (
                                <>
                                    <Link to="/my-orders" className={`${isActive("/my-orders")} inline-flex items-center gap-1.5`}>
                                        <Package size={15} /> {t("navOrders")}
                                    </Link>
                                    <Link to="/wishlist" className={`${isActive("/wishlist")} inline-flex items-center gap-1`}>
                                        <Heart size={15} /> {isHindi ? "पसंद" : "Saved"}
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {user && (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setNotifOpen((v) => !v)}
                                        aria-label="Notifications"
                                        className="relative w-10 h-10 rounded-full hover:bg-linen flex items-center justify-center text-ink transition-colors"
                                    >
                                        <Bell size={19} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-sindoor-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {notifOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white border border-parchment rounded-xl shadow-elevated z-50 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-parchment flex items-center justify-between">
                                                <span className="font-serif font-bold text-ink">
                                                    {isHindi ? "सूचनाएं" : "Updates"}
                                                </span>
                                                {unreadCount > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleMarkAllRead}
                                                        className="text-xs font-semibold text-sindoor-600 hover:underline"
                                                    >
                                                        {isHindi ? "सभी पढ़ें" : "Mark all read"}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-72 overflow-y-auto divide-y divide-parchment/60">
                                                {notifications.length === 0 ? (
                                                    <p className="p-4 text-xs text-umber text-center">
                                                        {isHindi ? "कोई नई सूचना नहीं" : "No notifications yet"}
                                                    </p>
                                                ) : (
                                                    notifications.slice(0, 8).map((n) => (
                                                        <div key={n._id} className={`p-3 text-xs ${n.isread ? "bg-white" : "bg-sindoor-50/40"}`}>
                                                            <p className="font-semibold text-ink">{n.title}</p>
                                                            <p className="text-umber mt-0.5">{n.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!user || user.role === "user") && (
                                <Link
                                    to="/cart"
                                    aria-label="Shopping Bag"
                                    className="relative w-10 h-10 rounded-full hover:bg-linen flex items-center justify-center text-ink transition-colors"
                                >
                                    <ShoppingBag size={20} />
                                    {itemCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-sindoor-600 text-white text-[10px] w-4.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center rounded-full font-bold">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {user ? (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-parchment hover:border-sindoor-400 transition-colors"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-sindoor-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-ink max-w-[100px] truncate">
                                            {user.name}
                                        </span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        aria-label="Sign out"
                                        title="Sign out"
                                        className="w-9 h-9 rounded-full hover:bg-red-50 text-umber hover:text-red-600 flex items-center justify-center transition-colors"
                                    >
                                        <LogOut size={17} />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="btn-secondary !py-2 !px-4 !min-h-[38px] text-sm">
                                        {t("navLogin")}
                                    </Link>
                                    <Link to="/register" className="btn-primary !py-2 !px-4 !min-h-[38px] text-sm">
                                        {t("navSignup")}
                                    </Link>
                                </div>
                            )}

                            <button
                                type="button"
                                className="md:hidden w-10 h-10 rounded-lg hover:bg-linen flex items-center justify-center text-ink"
                                onClick={() => setOpen((v) => !v)}
                                aria-label="Toggle menu"
                            >
                                {open ? <X size={22} /> : <Menu size={22} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {open && (
                    <div className="md:hidden bg-white border-t border-parchment px-4 py-4 space-y-2 animate-fade-in">
                        <Link to="/products" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                            {t("navShop")}
                        </Link>
                        <Link to="/track-order" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                            {t("navTrack")}
                        </Link>
                        <button
                            type="button"
                            onClick={() => { setOpen(false); openSizeGuide(); }}
                            className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-linen font-medium"
                        >
                            {t("navSizeGuide")}
                        </button>
                        {user ? (
                            <>
                                {user.role === "owner" && (
                                    <Link to="/owner/dashboard" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                                        {t("navDashboard")}
                                    </Link>
                                )}
                                {user.role === "admin" && (
                                    <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                                        {t("navAdmin")}
                                    </Link>
                                )}
                                <Link to="/my-orders" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                                    {t("navOrders")}
                                </Link>
                                <Link to="/profile" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-linen font-medium">
                                    {isHindi ? "मेरा प्रोफ़ाइल" : "My Profile"}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => { logout(); setOpen(false); }}
                                    className="w-full text-left py-2.5 px-3 rounded-lg text-red-600 font-semibold hover:bg-red-50"
                                >
                                    {isHindi ? "लॉगआउट" : "Sign Out"}
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm">
                                    {t("navLogin")}
                                </Link>
                                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm">
                                    {t("navSignup")}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Mobile Thumb Bottom Navigation Bar */}
            <nav
                aria-label="Mobile bottom navigation"
                className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-parchment grid grid-cols-4 text-[11px] font-medium text-umber"
            >
                <Link to="/" className={`flex flex-col items-center py-2 gap-0.5 ${location.pathname === "/" ? "text-sindoor-700 font-bold" : ""}`}>
                    <HomeIcon size={18} />
                    <span>{isHindi ? "होम" : "Home"}</span>
                </Link>
                <Link to="/products" className={`flex flex-col items-center py-2 gap-0.5 ${location.pathname === "/products" ? "text-sindoor-700 font-bold" : ""}`}>
                    <Search size={18} />
                    <span>{isHindi ? "चूड़ियाँ" : "Bangles"}</span>
                </Link>
                <Link to="/track-order" className={`flex flex-col items-center py-2 gap-0.5 ${location.pathname === "/track-order" ? "text-sindoor-700 font-bold" : ""}`}>
                    <Package size={18} />
                    <span>{isHindi ? "ऑर्डर" : "Track"}</span>
                </Link>
                <a href={`tel:${storeConfig.supportPhone}`} className="flex flex-col items-center py-2 gap-0.5 text-emerald-700 font-semibold">
                    <Phone size={18} />
                    <span>{isHindi ? "कॉल मदद" : "Call Help"}</span>
                </a>
            </nav>
        </>
    );
}
