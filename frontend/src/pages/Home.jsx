import { Link } from "react-router-dom";
import { FiArrowRight, FiStar, FiTruck, FiShield, FiHeart } from "react-icons/fi";
import { useState, useEffect } from "react";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Home() {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        productAPI.getAll({ limit: 4 }).then(({ data }) => {
            setFeatured(data.data?.products || []);
        }).catch(() => { });
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gold-50 via-white to-burgundy-50 min-h-[85vh] flex items-center">
                {/* Decorative floating elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gold-300/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-burgundy-300/15 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gold-200/10 rounded-full blur-2xl animate-float" />
                    {/* Sparkle dots */}
                    <div className="absolute top-32 right-1/4 w-2 h-2 bg-gold-400 rounded-full animate-sparkle" />
                    <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-gold-500 rounded-full animate-sparkle" style={{ animationDelay: '0.7s' }} />
                    <div className="absolute top-1/3 right-10 w-1 h-1 bg-gold-400 rounded-full animate-sparkle" style={{ animationDelay: '1.4s' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-100 to-gold-50 text-gold-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 border border-gold-200/50 shadow-sm">
                                <span className="animate-sparkle">✨</span> New Collection 2026
                            </span>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1]">
                                Adorn Your
                                <span className="block bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 bg-clip-text text-transparent mt-1">
                                    Beautiful Wrists
                                </span>
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg">
                                Discover our exquisite collection of handcrafted bangles, designed to add elegance
                                and grace to every occasion.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-10">
                                <Link to="/products" className="btn-primary flex items-center gap-2 text-lg !py-4 !px-8">
                                    Shop Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/products?category=Gold" className="btn-secondary text-lg !py-4 !px-8">
                                    Gold Collection
                                </Link>
                            </div>
                            {/* Trust badges */}
                            <div className="flex items-center gap-6 mt-10 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">⭐ 4.9 Rating</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="flex items-center gap-1.5">🚚 Free Shipping</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="flex items-center gap-1.5">💎 100% Genuine</span>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative hidden md:block animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                {/* Glowing rings */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gold-200 to-gold-400 rounded-full opacity-15 animate-pulse-ring" />
                                <div className="absolute inset-6 bg-gradient-to-br from-gold-100 to-gold-300 rounded-full opacity-20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                                <div className="absolute inset-12 bg-gradient-to-br from-gold-50 to-gold-200 rounded-full opacity-25" />
                                <div className="absolute inset-16 flex items-center justify-center">
                                    <span className="text-[120px] animate-float drop-shadow-lg">💍</span>
                                </div>
                                {/* Floating badges */}
                                <div className="absolute top-10 right-0 glass rounded-2xl px-5 py-3 shadow-xl animate-float" style={{ animationDelay: '0.3s' }}>
                                    <span className="text-sm font-semibold text-gold-700 flex items-center gap-1.5">⭐ Premium Quality</span>
                                </div>
                                <div className="absolute bottom-20 left-0 glass rounded-2xl px-5 py-3 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                                    <span className="text-sm font-semibold text-gold-700 flex items-center gap-1.5">🚚 Free Delivery</span>
                                </div>
                                <div className="absolute top-1/2 -left-4 glass rounded-2xl px-4 py-2.5 shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
                                    <span className="text-sm font-semibold text-gold-700 flex items-center gap-1.5">💎 100% Authentic</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gold-50/30 to-transparent pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
                        {[
                            { icon: <FiTruck size={28} />, title: "Free Shipping", desc: "On orders above ₹999", color: "from-blue-400 to-blue-600" },
                            { icon: <FiShield size={28} />, title: "Secure Payment", desc: "Razorpay protected", color: "from-green-400 to-green-600" },
                            { icon: <FiStar size={28} />, title: "Premium Quality", desc: "Handcrafted with care", color: "from-gold-400 to-gold-600" },
                            { icon: <FiHeart size={28} />, title: "Credit System", desc: "Buy now, pay later", color: "from-pink-400 to-pink-600" },
                        ].map((f, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl hover:bg-gold-50/80 transition-all duration-300 group hover:-translate-y-1">
                                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-gray-800 text-lg">{f.title}</h3>
                                <p className="text-sm text-gray-400 mt-1.5">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="py-20 bg-gradient-to-b from-white via-gold-50/30 to-gold-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <span className="inline-block text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">Curated For You</span>
                            <h2 className="text-4xl font-serif font-bold text-gray-900 section-heading">
                                Featured Collection
                            </h2>
                            <p className="text-gray-400 mt-4 text-lg">Handpicked favorites for you</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                            {featured.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/products" className="btn-secondary inline-flex items-center gap-2 text-lg !py-3.5 !px-8">
                                View All Products <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonial / Stats Strip */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger-children">
                        {[
                            { value: "5000+", label: "Happy Customers" },
                            { value: "10K+", label: "Bangles Sold" },
                            { value: "200+", label: "Unique Designs" },
                            { value: "50+", label: "Shop Owners" },
                        ].map((s, i) => (
                            <div key={i} className="group">
                                <p className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                                    {s.value}
                                </p>
                                <p className="text-gray-400 mt-2 font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-r from-gold-500 via-gold-600 to-gold-700 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-3xl mx-auto text-center px-4">
                    <span className="inline-block text-gold-200 text-sm font-semibold tracking-widest uppercase mb-4">Limited Time Offer</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
                        Start Your Collection Today
                    </h2>
                    <p className="text-gold-100 mt-5 text-lg md:text-xl leading-relaxed">
                        Join thousands of happy customers who trust Bangels Verse for their jewelry needs.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 mt-10 bg-white text-gold-700 font-bold py-4 px-10 rounded-xl hover:bg-gold-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
                    >
                        Create Account <FiArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
}
