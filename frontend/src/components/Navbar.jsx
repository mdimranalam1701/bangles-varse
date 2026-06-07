import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiPackage, FiGrid, FiHeart, FiBell, FiMessageCircle, FiMapPin, FiDollarSign } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { notificationAPI, chatAPI } from "../services/api";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { wishlistIds } = useWishlist();
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [unreadChat, setUnreadChat] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchCounts = async () => {
            try {
                const [notifRes, chatRes] = await Promise.all([
                    notificationAPI.getUnreadCount(),
                    chatAPI.getUnreadCount(),
                ]);
                setUnreadNotif(notifRes.data?.data?.count || 0);
                setUnreadChat(chatRes.data?.data?.count || 0);
            } catch {}
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-amber-100/60 shadow-sm shadow-amber-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <span className="text-3xl group-hover:animate-sparkle transition-transform duration-300 group-hover:scale-110">✨</span>
                        <span className="text-xl font-serif font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent tracking-tight">
                            Bangles Verse
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {(!user || user.role === "user") && (
                            <Link
                                to="/products"
                                className="text-gray-600 hover:text-gold-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                            >
                                Shop
                            </Link>
                        )}

                        {user ? (
                            <>
                                {user.role === "owner" && (
                                    <>
                                        <Link
                                            to="/owner/dashboard"
                                            className="flex items-center gap-1.5 text-gray-600 hover:text-gold-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                        >
                                            <FiGrid size={15} /> Dashboard
                                        </Link>
                                        <Link
                                            to="/my-shop"
                                            className="flex items-center gap-1.5 text-gray-600 hover:text-gold-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                        >
                                            🏪 My Shop
                                        </Link>
                                    </>
                                )}
                                {user.role === "admin" && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center gap-1.5 text-gray-600 hover:text-gold-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                    >
                                        <FiGrid size={15} /> Admin
                                    </Link>
                                )}
                                {user.role === "user" && (
                                    <>
                                        <Link
                                            to="/my-orders"
                                            className="flex items-center gap-1.5 text-gray-600 hover:text-gold-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                        >
                                            <FiPackage size={15} /> Orders
                                        </Link>
                                        <Link
                                            to="/credit-history"
                                            className="flex items-center gap-1.5 text-gray-600 hover:text-amber-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                        >
                                            <FiGrid size={15} /> Credits
                                        </Link>
                                        <Link
                                            to="/transactions"
                                            className="flex items-center gap-1.5 text-gray-600 hover:text-amber-600 font-medium transition-all duration-200 hover:translate-y-[-1px]"
                                        >
                                            <FiDollarSign size={15} /> Transactions
                                        </Link>
                                        <Link
                                            to="/wishlist"
                                            className="relative text-gray-600 hover:text-gold-600 transition-all duration-200 hover:scale-110"
                                            title="Wishlist"
                                        >
                                            <FiHeart size={20} />
                                            {wishlistIds.size > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{wishlistIds.size}</span>
                                            )}
                                        </Link>
                                    </>
                                )}
                                {user.role === "user" && (
                                    <Link to="/cart" className="relative text-gray-600 hover:text-gold-600 transition-all duration-200 hover:scale-110">
                                        <FiShoppingCart size={22} />
                                        {itemCount > 0 && (
                                            <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-br from-gold-400 to-gold-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md shadow-gold-300/40 animate-pulse-ring">
                                                {itemCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gold-100">
                                    <Link to="/notifications" className="relative text-gray-600 hover:text-gold-600 transition-all duration-200 hover:scale-110" title="Notifications">
                                        <FiBell size={20} />
                                        {unreadNotif > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">{unreadNotif}</span>
                                        )}
                                    </Link>
                                    <Link to="/chat" className="relative text-gray-600 hover:text-gold-600 transition-all duration-200 hover:scale-110" title="Messages">
                                        <FiMessageCircle size={20} />
                                        {unreadChat > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{unreadChat}</span>
                                        )}
                                    </Link>
                                    <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group/profile">
                                        <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-gold-200 group-hover/profile:ring-gold-400 transition-all duration-300 shadow-md shadow-gold-200/40">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 group-hover/profile:text-gold-700 transition-colors">{user.name}</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                                        title="Logout"
                                    >
                                        <FiLogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-gray-600"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gold-100 animate-fade-in shadow-lg shadow-gold-100/20">
                    <div className="px-4 py-4 space-y-1">
                        {(!user || user.role === "user") && (
                            <Link
                                to="/products"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                            >
                                <span className="text-lg">🛍️</span> Shop
                            </Link>
                        )}
                        {user ? (
                            <>
                                {user.role === "owner" && (
                                    <>
                                        <Link
                                            to="/owner/dashboard"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                        >
                                            <span className="text-lg">📊</span> Dashboard
                                        </Link>
                                        <Link
                                            to="/my-shop"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                        >
                                            <span className="text-lg">🏪</span> My Shop
                                        </Link>
                                    </>
                                )}
                                {user.role === "admin" && (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                    >
                                        <span className="text-lg">📊</span> Admin
                                    </Link>
                                )}
                                <Link
                                    to="/my-orders"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">📦</span> My Orders
                                </Link>
                                {user.role === "user" && (
                                    <>
                                        <Link
                                            to="/wishlist"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                        >
                                            <span className="text-lg">💝</span> Wishlist
                                            {wishlistIds.size > 0 && (
                                                <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{wishlistIds.size}</span>
                                            )}
                                        </Link>
                                        <Link
                                            to="/credit-history"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                        >
                                            <span className="text-lg">💳</span> Credit History
                                        </Link>
                                    </>
                                )}
                                <Link
                                    to="/notifications"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">🔔</span> Notifications
                                    {unreadNotif > 0 && (
                                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadNotif}</span>
                                    )}
                                </Link>
                                <Link
                                    to="/chat"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">💬</span> Messages
                                    {unreadChat > 0 && (
                                        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadChat}</span>
                                    )}
                                </Link>
                                <Link
                                    to="/addresses"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">📍</span> Addresses
                                </Link>
                                {user.role === "user" && (
                                    <Link
                                        to="/cart"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                    >
                                        <span className="text-lg">🛒</span> Cart
                                        {itemCount > 0 && (
                                            <span className="ml-auto bg-gold-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{itemCount}</span>
                                        )}
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    👤 My Profile
                                </Link>
                                <button
                                    onClick={() => { logout(); setOpen(false); }}
                                    className="flex items-center gap-3 w-full py-3 px-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">🚪</span> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-xl font-medium transition-all duration-200"
                                >
                                    <span className="text-lg">🔑</span> Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 py-3 px-3 text-gold-600 font-semibold hover:bg-gold-50 rounded-xl transition-all duration-200"
                                >
                                    <span className="text-lg">✨</span> Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
