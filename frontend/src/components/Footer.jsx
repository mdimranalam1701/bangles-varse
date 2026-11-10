import { Link } from "react-router-dom";
import { Phone, MessageCircle, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useLang } from "../context/LangContext";
import { BrandMark } from "./UI";

export default function Footer() {
    const { isHindi, storeConfig, openSizeGuide } = useLang();

    const waNumber = String(storeConfig.supportWhatsapp || "919876543210").replace(/\D/g, "");

    return (
        <footer className="bg-ink text-ivory/90 mt-auto pb-16 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link to="/" className="flex items-center gap-2.5">
                            <BrandMark className="w-8 h-8" />
                            <span className="text-2xl font-serif font-bold text-white">Bangels Verse</span>
                        </Link>
                        <p className="mt-3 text-sm text-ivory/70 leading-relaxed">
                            {isHindi
                                ? "जयपुर और फिरोजाबाद के असली कारीगरों से सीधे घर तक हस्तनिर्मित चूड़ियाँ व दुल्हन चूड़ा।"
                                : "Handcrafted Jaipur Lac, Kundan, 22K Gold-Plated & Bridal Chooda directly from verified family ateliers."}
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-xs text-brass-200">
                            <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> COD Available</span>
                            <span className="inline-flex items-center gap-1"><Truck size={14} /> Pan-India</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-lg text-white mb-3">
                            {isHindi ? "ज़रूरी लिंक" : "Quick Links"}
                        </h4>
                        <div className="space-y-2 text-sm text-ivory/75">
                            <Link to="/products" className="block hover:text-brass-200">
                                {isHindi ? "सभी चूड़ियाँ" : "All Bangles"}
                            </Link>
                            <Link to="/track-order" className="block hover:text-brass-200">
                                {isHindi ? "ऑर्डर ट्रैक करें" : "Track My Order"}
                            </Link>
                            <button type="button" onClick={openSizeGuide} className="block hover:text-brass-200 text-left">
                                {isHindi ? "हाथ का नाप (Size Guide)" : "Bangle Size Guide"}
                            </button>
                            <Link to="/register" className="block hover:text-brass-200">
                                {isHindi ? "दुकानदार जुड़ें" : "Sell as Shop Owner"}
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-lg text-white mb-3">
                            {isHindi ? "प्रमुख श्रेणियाँ" : "Collections"}
                        </h4>
                        <div className="space-y-2 text-sm text-ivory/75">
                            <Link to="/products?category=Bridal" className="block hover:text-brass-200">Bridal Chooda</Link>
                            <Link to="/products?category=Gold" className="block hover:text-brass-200">22K Gold Plated</Link>
                            <Link to="/products?category=Lac" className="block hover:text-brass-200">Jaipur Meenakari Lac</Link>
                            <Link to="/products?category=Glass" className="block hover:text-brass-200">Firozabad Velvet Glass</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-serif font-bold text-lg text-white mb-3">
                            {isHindi ? "मदद व संपर्क" : "Direct Order Help"}
                        </h4>
                        <div className="space-y-2.5 text-sm text-ivory/80">
                            <a href={`tel:${storeConfig.supportPhone}`} className="flex items-center gap-2 hover:text-brass-200">
                                <Phone size={15} /> +91 {storeConfig.supportPhone}
                            </a>
                            <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-emerald-100 hover:text-white"
                            >
                                <MessageCircle size={15} /> WhatsApp Support
                            </a>
                            <p className="flex items-center gap-2 text-ivory/65">
                                <MapPin size={15} /> Johari Bazaar, Jaipur, India
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ivory/55">
                    <span>© {new Date().getFullYear()} Bangels Verse. All rights reserved.</span>
                    <span>{isHindi ? "सरल व सुरक्षित भारतीय कारीगर बाज़ार" : "Built for effortless shopping across India"}</span>
                </div>
            </div>
        </footer>
    );
}
