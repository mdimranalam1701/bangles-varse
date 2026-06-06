import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gold-50/80 via-white to-white border-t border-gold-100/60 mt-auto relative overflow-hidden">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" />

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <span className="text-3xl group-hover:animate-sparkle">✨</span>
                            <span className="text-xl font-serif font-bold bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">
                                Bangels Verse
                            </span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                            Exquisite handcrafted bangles and jewelry that celebrate the art of adornment.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <a href="#" className="w-10 h-10 bg-gradient-to-br from-gold-100 to-gold-50 rounded-xl flex items-center justify-center text-gold-600 hover:from-gold-500 hover:to-gold-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FiInstagram size={17} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gradient-to-br from-gold-100 to-gold-50 rounded-xl flex items-center justify-center text-gold-600 hover:from-gold-500 hover:to-gold-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FiFacebook size={17} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gradient-to-br from-gold-100 to-gold-50 rounded-xl flex items-center justify-center text-gold-600 hover:from-gold-500 hover:to-gold-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                <FiTwitter size={17} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-4 text-lg">Quick Links</h4>
                        <div className="space-y-3">
                            {[
                                { to: "/products", label: "All Products" },
                                { to: "/cart", label: "Shopping Cart" },
                                { to: "/my-orders", label: "My Orders" },
                                { to: "/profile", label: "My Profile" },
                            ].map((link) => (
                                <Link key={link.to} to={link.to} className="block text-sm text-gray-500 hover:text-gold-600 hover:translate-x-1 transition-all duration-200">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-4 text-lg">Categories</h4>
                        <div className="space-y-3">
                            {["Gold", "Silver", "Diamond", "Platinum", "Rose Gold"].map((cat) => (
                                <Link key={cat} to={`/products?category=${cat}`} className="block text-sm text-gray-500 hover:text-gold-600 hover:translate-x-1 transition-all duration-200">
                                    {cat} Bangles
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-4 text-lg">Contact Us</h4>
                        <div className="space-y-3 text-sm text-gray-500">
                            <p className="flex items-center gap-2.5">📧 hello@bangelsverse.com</p>
                            <p className="flex items-center gap-2.5">📞 +91 98765 43210</p>
                            <p className="flex items-center gap-2.5">📍 Mumbai, India</p>
                        </div>
                        {/* Newsletter hint */}
                        <div className="mt-6 p-4 bg-gold-50/80 rounded-xl border border-gold-100/50">
                            <p className="text-xs text-gold-700 font-semibold mb-1">💌 Stay Updated</p>
                            <p className="text-xs text-gray-500">Get notified about new collections and offers.</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gold-100/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">
                        © 2026 Bangels Verse. Crafted with ❤️ for beautiful wrists.
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-400">
                        <a href="#" className="hover:text-gold-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gold-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gold-600 transition-colors">Shipping Info</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
