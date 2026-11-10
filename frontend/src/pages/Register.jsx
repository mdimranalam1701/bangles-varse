import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Mail, Lock, Store, ShoppingBag, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { BrandMark } from "../components/UI";

export default function Register() {
    const { register } = useAuth();
    const { isHindi } = useLang();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [companyName, setCompanyName] = useState("");
    const [city, setCity] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await register({
            name,
            phone,
            email: email || undefined,
            password,
            role,
            companyName: role === "owner" ? companyName : undefined,
            city,
        });
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <div className="inline-flex justify-center mb-3">
                        <BrandMark className="w-11 h-11" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-ink">
                        {isHindi ? "नया खाता बनाएं" : "Create Your Account"}
                    </h1>
                    <p className="text-sm text-umber mt-1">
                        {isHindi ? "सिर्फ़ नाम, मोबाइल और 4 अंक का पिन डालें" : "Simple phone registration — email is optional for buyers"}
                    </p>
                </div>

                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("user")}
                                className={`p-3 rounded-xl border text-center transition-colors ${
                                    role === "user" ? "border-sindoor-600 bg-sindoor-50" : "border-parchment bg-white"
                                }`}
                            >
                                <ShoppingBag size={20} className="mx-auto text-sindoor-600 mb-1" />
                                <span className="text-sm font-bold text-ink">
                                    {isHindi ? "ग्राहक (खरीददार)" : "Customer"}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("owner")}
                                className={`p-3 rounded-xl border text-center transition-colors ${
                                    role === "owner" ? "border-sindoor-600 bg-sindoor-50" : "border-parchment bg-white"
                                }`}
                            >
                                <Store size={20} className="mx-auto text-brass-600 mb-1" />
                                <span className="text-sm font-bold text-ink">
                                    {isHindi ? "दुकानदार (विक्रेता)" : "Shop Owner"}
                                </span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "आपका पूरा नाम *" : "Full Name *"}
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={isHindi ? "सुनीता देवी" : "Your full name"}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "10 अंकों का मोबाइल नंबर *" : "10-Digit Mobile Number *"}
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="9876543210"
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {role === "owner" && (
                            <div>
                                <label className="block text-sm font-semibold text-ink mb-1">
                                    {isHindi ? "दुकान का नाम *" : "Shop / Atelier Name *"}
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="e.g. Johari Kundan Bangles"
                                    className="input-field"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "ईमेल (वैकल्पिक)" : role === "owner" ? "Email *" : "Email (Optional)"}
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field !pl-10"
                                    required={role === "owner"}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "4-अंक का पिन या पासवर्ड *" : "4-Digit PIN or Password *"}
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="e.g. 1234"
                                    minLength={4}
                                    className="input-field !pl-10 !pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-umber/60"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">
                                {isHindi ? "शहर / गाँव" : "City / Town"}
                            </label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder={isHindi ? "जयपुर, लखनऊ..." : "Jaipur, Lucknow..."}
                                className="input-field"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full text-base">
                            {loading ? "..." : isHindi ? "खाता बनाएं" : "Create Account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-umber">
                    {isHindi ? "पहले से खाता है?" : "Already have an account?"}{" "}
                    <Link to="/login" className="text-sindoor-700 font-semibold hover:underline">
                        {isHindi ? "लॉगिन करें" : "Sign In"}
                    </Link>
                </p>
            </div>
        </div>
    );
}
