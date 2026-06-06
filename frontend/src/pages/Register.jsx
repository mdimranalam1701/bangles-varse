import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await register(name, email, password, role);
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-gold-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-gold-300/15 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in-up">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-xl shadow-gold-300/30 mb-6 -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-gray-900">Join Bangels Verse</h1>
                    <p className="text-gray-400 mt-2 text-lg">Create your account to start shopping</p>
                </div>

                <div className="card p-8 !shadow-xl !shadow-gold-100/30 border border-gold-100/30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <div className="relative group">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="input-field !pl-11 !py-3.5"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <div className="relative group">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field !pl-11 !py-3.5"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500 transition-colors" size={18} />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field !pl-11 !pr-11 !py-3.5"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-600 transition-colors"
                                >
                                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("user")}
                                    className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                                        role === "user"
                                            ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-100/50"
                                            : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30"
                                    }`}
                                >
                                    {role === "user" && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                    <span className="text-3xl block mb-1">🛍️</span>
                                    <p className={`text-sm font-semibold ${role === "user" ? "text-gold-700" : "text-gray-600"}`}>
                                        Customer
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("owner")}
                                    className={`relative p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                                        role === "owner"
                                            ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-100/50"
                                            : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30"
                                    }`}
                                >
                                    {role === "owner" && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                    <span className="text-3xl block mb-1">🏪</span>
                                    <p className={`text-sm font-semibold ${role === "owner" ? "text-gold-700" : "text-gray-600"}`}>
                                        Shop Owner
                                    </p>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full !py-4 !text-base"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : "Create Account"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-gray-400">or</span>
                        </div>
                    </div>

                    <p className="text-center text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-gold-600 font-bold hover:text-gold-700 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
