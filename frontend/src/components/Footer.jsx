import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gold-50 to-white border-t border-gold-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-3xl">✨</span>
                            <span className="text-xl font-serif font-bold bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">
                                Bangels Verse
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                            Exquisite handcrafted bangles and jewelry that celebrate the art of adornment.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <a href="#" className="w-9 h-9 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 hover:bg-gold-200 transition-colors">
                                <FiInstagram size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 hover:bg-gold-200 transition-colors">
                                <FiFacebook size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 hover:bg-gold-200 transition-colors">
                                <FiTwitter size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-3">Quick Links</h4>
                        <div className="space-y-2">
                            <Link to="/products" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                All Products
                            </Link>
                            <Link to="/cart" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                Shopping Cart
                            </Link>
                            <Link to="/my-orders" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                My Orders
                            </Link>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-3">Categories</h4>
                        <div className="space-y-2">
                            <Link to="/products?category=Gold" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                Gold Bangles
                            </Link>
                            <Link to="/products?category=Silver" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                Silver Bangles
                            </Link>
                            <Link to="/products?category=Diamond" className="block text-sm text-gray-500 hover:text-gold-600 transition-colors">
                                Diamond Collection
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-serif font-semibold text-gray-800 mb-3">Contact Us</h4>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>📧 hello@bangelsverse.com</p>
                            <p>📞 +91 98765 43210</p>
                            <p>📍 Mumbai, India</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gold-100 mt-8 pt-6 text-center text-sm text-gray-400">
                    © 2026 Bangels Verse. Crafted with ❤️ for beautiful wrists.
                </div>
            </div>
        </footer>
    );
}
