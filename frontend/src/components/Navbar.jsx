import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiPackage, FiGrid } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 glass border-b border-gold-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-3xl">✨</span>
                        <span className="text-xl font-serif font-bold bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">
                            Bangels Verse
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {(!user || user.role === "user") && (
                            <Link
                                to="/products"
                                className="text-gray-600 hover:text-gold-600 font-medium transition-colors"
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
                                            className="flex items-center gap-1 text-gray-600 hover:text-gold-600 font-medium transition-colors"
                                        >
                                            <FiGrid size={16} /> Dashboard
                                        </Link>
                                        <Link
                                            to="/my-shop"
                                            className="flex items-center gap-1 text-gray-600 hover:text-gold-600 font-medium transition-colors"
                                        >
                                            🏪 My Shop
                                        </Link>
                                    </>
                                )}
                                {user.role === "admin" && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center gap-1 text-gray-600 hover:text-gold-600 font-medium transition-colors"
                                    >
                                        <FiGrid size={16} /> Admin
                                    </Link>
                                )}
                                {user.role === "user" && (
                                    <Link
                                        to="/my-orders"
                                        className="flex items-center gap-1 text-gray-600 hover:text-gold-600 font-medium transition-colors"
                                    >
                                        <FiPackage size={16} /> Orders
                                    </Link>
                                )}
                                {user.role === "user" && (
                                    <Link to="/cart" className="relative text-gray-600 hover:text-gold-600 transition-colors">
                                        <FiShoppingCart size={22} />
                                        {itemCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                                {itemCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <div className="flex items-center gap-2 ml-2">
                                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                user.name?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
                <div className="md:hidden bg-white border-t border-gold-100 animate-fade-in">
                    <div className="px-4 py-4 space-y-3">
                        {(!user || user.role === "user") && (
                            <Link
                                to="/products"
                                onClick={() => setOpen(false)}
                                className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                            >
                                🛍️ Shop
                            </Link>
                        )}
                        {user ? (
                            <>
                                {user.role === "owner" && (
                                    <>
                                        <Link
                                            to="/owner/dashboard"
                                            onClick={() => setOpen(false)}
                                            className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                        >
                                            📊 Dashboard
                                        </Link>
                                        <Link
                                            to="/my-shop"
                                            onClick={() => setOpen(false)}
                                            className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                        >
                                            🏪 My Shop
                                        </Link>
                                    </>
                                )}
                                {user.role === "admin" && (
                                    <Link
                                        to="/admin/dashboard"
                                        onClick={() => setOpen(false)}
                                        className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                    >
                                        📊 Admin
                                    </Link>
                                )}
                                <Link
                                    to="/my-orders"
                                    onClick={() => setOpen(false)}
                                    className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                >
                                    📦 My Orders
                                </Link>
                                {user.role === "user" && (
                                    <Link
                                        to="/cart"
                                        onClick={() => setOpen(false)}
                                        className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                    >
                                        🛒 Cart ({itemCount})
                                    </Link>
                                )}
                                <Link
                                    to="/profile"
                                    onClick={() => setOpen(false)}
                                    className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                >
                                    👤 My Profile
                                </Link>
                                <button
                                    onClick={() => { logout(); setOpen(false); }}
                                    className="block w-full text-left py-2 text-red-500 font-medium"
                                >
                                    🚪 Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setOpen(false)}
                                    className="block py-2 text-gray-700 hover:text-gold-600 font-medium"
                                >
                                    🔑 Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setOpen(false)}
                                    className="block py-2 text-gold-600 font-semibold"
                                >
                                    ✨ Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
