import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Phone,
    MessageCircle,
    ShieldCheck,
    Truck,
    Sparkles,
    Search,
    CheckCircle2,
    Ruler,
} from "lucide-react";
import { productAPI } from "../services/api";
import { useLang } from "../context/LangContext";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/UI";

const CATEGORY_SHOWCASE = [
    { key: "Bridal", labelEn: "Bridal Chooda", labelHi: "दुल्हन चूड़ा", img: "/images/products/bridal-chooda.svg" },
    { key: "Gold", labelEn: "22K Gold Plated", labelHi: "गोल्ड कंगन", img: "/images/products/gold-kada.svg" },
    { key: "Lac", labelEn: "Jaipur Lac", labelHi: "जयपुरी लाख", img: "/images/products/meenakari-lac.svg" },
    { key: "Glass", labelEn: "Velvet Glass", labelHi: "मखमली कांच", img: "/images/products/velvet-glass.svg" },
    { key: "Diamond", labelEn: "AD & Diamond", labelHi: "डायमंड कंगन", img: "/images/products/diamond-sleek.svg" },
    { key: "Silver", labelEn: "Silver Kada", labelHi: "चांदी कड़ा", img: "/images/products/silver-peacock.svg" },
];

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, isHindi, storeConfig, openSizeGuide } = useLang();

    useEffect(() => {
        productAPI
            .getAll({ limit: 8, sort: "featured" })
            .then(({ data }) => {
                setFeatured(data.data?.products || []);
            })
            .catch(() => setFeatured([]))
            .finally(() => setLoading(false));
    }, []);

    const waNumber = String(storeConfig.supportWhatsapp || "919876543210").replace(/\D/g, "");

    return (
        <div>
            {/* Editorial Asymmetric Hero */}
            <section className="bg-ivory border-b border-parchment">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-6 space-y-6 animate-fade-in">
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sindoor-700 bg-sindoor-50 border border-sindoor-200 px-3.5 py-1.5 rounded-full">
                                {t("heroEyebrow")}
                            </span>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ink leading-[1.08]">
                                {t("heroTitle1")}
                                <span className="block text-sindoor-700 italic font-semibold mt-1">
                                    {t("heroTitle2")}
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-umber leading-relaxed max-w-xl">
                                {t("heroSub")}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-1">
                                <Link to="/products" className="btn-primary text-base px-7">
                                    {t("heroCtaPrimary")} <ArrowRight size={18} />
                                </Link>
                                <Link to="/track-order" className="btn-secondary text-base px-6">
                                    <Search size={17} /> {t("heroCtaSecondary")}
                                </Link>
                            </div>

                            {/* Trust Anchors */}
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-parchment text-xs text-umber">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={17} className="text-emerald-600 shrink-0" />
                                    <span className="font-medium">{isHindi ? "कैश ऑन डिलीवरी" : "Cash on Delivery"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck size={17} className="text-sindoor-600 shrink-0" />
                                    <span className="font-medium">{isHindi ? "सीधे घर डिलीवरी" : "Home Delivery"}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={openSizeGuide}
                                    className="flex items-center gap-2 text-left hover:text-sindoor-700"
                                >
                                    <Ruler size={17} className="text-brass-600 shrink-0" />
                                    <span className="font-medium underline">{t("navSizeGuide")}</span>
                                </button>
                            </div>
                        </div>

                        {/* Hero Editorial Photo */}
                        <div className="lg:col-span-6">
                            <div className="relative rounded-2xl overflow-hidden border border-parchment shadow-elevated bg-linen">
                                <img
                                    src="/images/hero-bangles.jpg"
                                    alt="Handcrafted 22K Gold Kundan and Crimson Velvet Lac Bangles on raw ivory silk"
                                    width="1200"
                                    height="800"
                                    fetchPriority="high"
                                    className="w-full h-[300px] sm:h-[420px] lg:h-[460px] object-cover"
                                />
                                <div className="bg-white/95 backdrop-blur-xs border-t border-parchment px-5 py-3.5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-serif font-bold text-ink text-base">
                                            {isHindi ? "जयपुर शाही कुंदन व सिंदूरी चूड़ा" : "Royal Jaipur Kundan & Sindoor Lac"}
                                        </p>
                                        <p className="text-xs text-umber">
                                            {isHindi ? "बिना लॉगिन के 30 सेकंड में ऑर्डर करें" : "Order in 30 seconds — no password needed"}
                                        </p>
                                    </div>
                                    <Link to="/products?category=Bridal" className="btn-brass !py-2 !px-4 text-xs shrink-0">
                                        {isHindi ? "देखें" : "Explore"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 Simple Steps Strip for First-Time / Non-Tech-Savvy Clients */}
            <section className="bg-linen/70 border-b border-parchment py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                            {t("stepStripTitle")}
                        </h2>
                        <span className="text-xs font-semibold text-sindoor-700">
                            {isHindi ? "100% सरल व सुरक्षित प्रक्रिया" : "Designed for effortless mobile ordering"}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            { title: t("step1Title"), desc: t("step1Desc"), icon: Sparkles },
                            { title: t("step2Title"), desc: t("step2Desc"), icon: Phone },
                            { title: t("step3Title"), desc: t("step3Desc"), icon: CheckCircle2 },
                        ].map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <div key={i} className="bg-white border border-parchment rounded-xl p-5 flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-lg bg-sindoor-50 text-sindoor-700 border border-sindoor-200 flex items-center justify-center shrink-0">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-lg text-ink">{step.title}</h3>
                                        <p className="text-sm text-umber mt-1 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Visual Category Tiles */}
            <section className="py-14 bg-ivory">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-ink">{t("categoriesTitle")}</h2>
                            <p className="text-sm text-umber mt-1">
                                {isHindi ? "अपनी पसंद की श्रेणी पर टैप करें" : "Tap any craft to browse matching sets"}
                            </p>
                        </div>
                        <Link to="/products" className="text-sm font-semibold text-sindoor-700 hover:underline inline-flex items-center gap-1">
                            {t("viewAll")} <ArrowRight size={15} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {CATEGORY_SHOWCASE.map((cat) => (
                            <Link
                                key={cat.key}
                                to={`/products?category=${encodeURIComponent(cat.key)}`}
                                className="card p-3 text-center group hover:border-sindoor-400 transition-colors"
                            >
                                <div className="aspect-square rounded-lg bg-linen overflow-hidden mb-2.5">
                                    <img
                                        src={cat.img}
                                        alt={cat.labelEn}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <p className="font-serif font-bold text-base text-ink group-hover:text-sindoor-700">
                                    {isHindi ? cat.labelHi : cat.labelEn}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Collection */}
            <section className="py-14 bg-white border-y border-parchment">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
                                {t("featuredTitle")}
                            </h2>
                            <p className="text-umber mt-1 text-sm sm:text-base">{t("featuredSub")}</p>
                        </div>
                        <Link to="/products" className="btn-secondary !py-2.5 text-sm">
                            {t("viewAll")} <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <ProductGridSkeleton count={4} />
                    ) : featured.length === 0 ? (
                        <div className="text-center py-12 text-umber">
                            {isHindi ? "अभी कोई उत्पाद उपलब्ध नहीं है।" : "Products are loading or coming soon."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featured.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Artisan Craft Story */}
            <section className="py-16 bg-ivory">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-8 items-center bg-white border border-parchment rounded-2xl overflow-hidden shadow-atelier">
                        <div className="lg:col-span-6 h-full">
                            <img
                                src="/images/artisan-craft.jpg"
                                alt="Master Indian artisan hand-setting Kundan stones on a gold bangle"
                                loading="lazy"
                                className="w-full h-72 sm:h-96 object-cover"
                            />
                        </div>
                        <div className="lg:col-span-6 p-6 sm:p-10 space-y-4">
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-brass-700">
                                {isHindi ? "असली भारतीय कारीगरी" : "DIRECT FROM ARTISAN WORKSHOPS"}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink leading-tight">
                                {t("craftTitle")}
                            </h2>
                            <p className="text-umber leading-relaxed">{t("craftDesc")}</p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link to="/products" className="btn-primary">
                                    {t("heroCtaPrimary")}
                                </Link>
                                <Link to="/register" className="btn-secondary">
                                    {isHindi ? "अपनी दुकान जोड़ें" : "Partner as Shop Owner"}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Direct Phone / WhatsApp Human Help Banner */}
            <section className="py-12 bg-sindoor-700 text-ivory">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                            {t("assistBannerTitle")}
                        </h2>
                        <p className="text-ivory/85 mt-1.5 text-sm sm:text-base max-w-xl">
                            {t("assistBannerDesc")}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 shrink-0">
                        <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Namaste! I need help ordering bangles from Bangels Verse.")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp border border-white/20"
                        >
                            <MessageCircle size={18} /> {t("whatsappOrder")}
                        </a>
                        <a
                            href={`tel:${storeConfig.supportPhone}`}
                            className="btn-secondary !bg-white !text-ink"
                        >
                            <Phone size={17} /> {storeConfig.supportPhone}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
