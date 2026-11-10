import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { BrandMark } from "../components/UI";

export default function Login() {
    const { login } = useAuth();
    const { isHindi } = useLang();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await login(identifier, password);
        setLoading(false);
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <div className="inline-flex justify-center mb-3">
                        <BrandMark className="w-11 h-11" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-ink">
                        {isHindi ? "अपने खाते में आएं" : "Sign In"}
                    </h1>
                    <p className="text-sm text-umber mt-1">
                        {isHindi
                            ? "मोबाइल नंबर या ईमेल से लॉगिन करें"
                            : "Use your 10-digit mobile number or email"}
                    </p>
                </div>

                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="login-id" className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "मोबाइल नंबर या ईमेल" : "Mobile Number or Email"}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" size={17} />
                                <input
                                    id="login-id"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={isHindi ? "9876543210 या email" : "9811122233 or you@example.com"}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="login-pass" className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "पिन या पासवर्ड" : "4-Digit PIN or Password"}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" size={17} />
                                <input
                                    id="login-pass"
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••"
                                    className="input-field !pl-10 !pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    aria-label="Toggle password visibility"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-umber/60 hover:text-ink"
                                >
                                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full text-base">
                            {loading ? "..." : isHindi ? "लॉगिन करें" : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-parchment text-center text-xs text-umber">
                        {isHindi ? "चूड़ियाँ खरीदने के लिए लॉगिन ज़रूरी नहीं — " : "No login required to shop — "}
                        <Link to="/products" className="text-sindoor-700 font-semibold hover:underline">
                            {isHindi ? "1-टैप ऑर्डर करें" : "Use 1-Tap Quick Order"}
                        </Link>
                    </div>
                </div>

                <p className="text-center text-sm text-umber">
                    {isHindi ? "नया खाता बनाना है?" : "New to Bangels Verse?"}{" "}
                    <Link to="/register" className="text-sindoor-700 font-semibold hover:underline">
                        {isHindi ? "खाता बनाएं" : "Create Account"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
