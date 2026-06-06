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
            <section className="relative overflow-hidden bg-gradient-to-br from-gold-50 via-white to-burgundy-50">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-gold-300 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-burgundy-300 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in">
                            <span className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                                ✨ New Collection 2026
                            </span>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
                                Adorn Your
                                <span className="block bg-gradient-to-r from-gold-500 to-gold-700 bg-clip-text text-transparent">
                                    Beautiful Wrists
                                </span>
                            </h1>
                            <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg">
                                Discover our exquisite collection of handcrafted bangles, designed to add elegance
                                and grace to every occasion.
                            </p>
                            <div className="flex flex-wrap gap-4 mt-8">
                                <Link to="/products" className="btn-primary flex items-center gap-2 text-lg">
                                    Shop Now <FiArrowRight />
                                </Link>
                                <Link to="/products?category=Gold" className="btn-secondary text-lg">
                                    Gold Collection
                                </Link>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative hidden md:block">
                            <div className="relative w-full aspect-square max-w-md mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-gold-200 to-gold-400 rounded-full opacity-20 animate-pulse" />
                                <div className="absolute inset-8 bg-gradient-to-br from-gold-100 to-gold-300 rounded-full opacity-30" />
                                <div className="absolute inset-16 flex items-center justify-center">
                                    <span className="text-[120px]">💍</span>
                                </div>
                                {/* Floating badges */}
                                <div className="absolute top-10 right-0 glass rounded-xl px-4 py-2 shadow-lg animate-bounce">
                                    <span className="text-sm font-medium text-gold-700">⭐ Premium Quality</span>
                                </div>
                                <div className="absolute bottom-20 left-0 glass rounded-xl px-4 py-2 shadow-lg">
                                    <span className="text-sm font-medium text-gold-700">🚚 Free Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: <FiTruck size={28} />, title: "Free Shipping", desc: "On orders above ₹999" },
                            { icon: <FiShield size={28} />, title: "Secure Payment", desc: "Razorpay protected" },
                            { icon: <FiStar size={28} />, title: "Premium Quality", desc: "Handcrafted with care" },
                            { icon: <FiHeart size={28} />, title: "Credit System", desc: "Buy now, pay later" },
                        ].map((f, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl hover:bg-gold-50 transition-colors">
                                <div className="w-14 h-14 mx-auto bg-gold-100 rounded-2xl flex items-center justify-center text-gold-600 mb-3">
                                    {f.icon}
                                </div>
                                <h3 className="font-semibold text-gray-800">{f.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section className="py-16 bg-gradient-to-b from-white to-gold-50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-serif font-bold text-gray-900">
                                Featured Collection
                            </h2>
                            <p className="text-gray-400 mt-2">Handpicked favorites for you</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featured.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
                                View All Products <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-700">
                <div className="max-w-3xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
                        Start Your Collection Today
                    </h2>
                    <p className="text-gold-100 mt-4 text-lg">
                        Join thousands of happy customers who trust Bangels Verse for their jewelry needs.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 mt-8 bg-white text-gold-700 font-bold py-3 px-8 rounded-xl hover:bg-gold-50 transition-colors shadow-lg"
                    >
                        Create Account <FiArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
}
