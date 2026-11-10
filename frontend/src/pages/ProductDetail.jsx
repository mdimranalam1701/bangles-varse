import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingBag,
    Zap,
    MessageCircle,
    Phone,
    Ruler,
    Store,
    ShieldCheck,
    Minus,
    Plus,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { productAPI, reviewAPI, chatAPI, resolveAssetUrl } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { StarRating, LoadingSpinner, PriceTag } from "../components/UI";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { openQuickOrder, openSizeGuide, t, isHindi, storeConfig } = useLang();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("2.6");
    const [quantity, setQuantity] = useState(1);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([productAPI.getById(id), reviewAPI.get(id)])
            .then(([prodRes, revRes]) => {
                const p = prodRes.data?.data || null;
                setProduct(p);
                if (p?.sizes?.length) setSelectedSize(p.sizes[0]);
                setReviews(revRes.data?.data || []);
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please tap stars to rate");
            return;
        }
        setSubmitting(true);
        try {
            await reviewAPI.add(id, { rating, comment });
            toast.success("Thank you for your review!");
            setRating(0);
            setComment("");
            const revRes = await reviewAPI.get(id);
            setReviews(revRes.data?.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add review");
        }
        setSubmitting(false);
    };

    if (loading) return <LoadingSpinner />;
    if (!product) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif font-bold text-ink">Product not found</h2>
                <button type="button" onClick={() => navigate("/products")} className="btn-primary mt-4">
                    Back to Shop
                </button>
            </div>
        );
    }

    const sizes = product.sizes?.length ? product.sizes : ["2.4", "2.6", "2.8"];
    const imgSrc = resolveAssetUrl(product.image || product.images?.[0]) || "/images/products/gold-kada.svg";
    const waNumber = String(product.owner?.whatsappNumber || product.owner?.phone || storeConfig.supportWhatsapp).replace(/\D/g, "");
    const waHref = `https://wa.me/${waNumber.length === 10 ? `91${waNumber}` : waNumber}?text=${encodeURIComponent(
        `Namaste! I want to order "${product.name}" (Size ${selectedSize}, Qty ${quantity}) — Rs.${product.price * quantity}`
    )}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-medium text-umber hover:text-sindoor-700 mb-6"
            >
                <ArrowLeft size={16} /> {isHindi ? "पीछे जाएं" : "Back"}
            </button>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Product Visual */}
                <div className="lg:col-span-6">
                    <div className="card bg-linen aspect-square">
                        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Product Details & Effortless Ordering */}
                <div className="lg:col-span-6 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {product.category && (
                            <span className="badge bg-sindoor-50 text-sindoor-700 border border-sindoor-200">
                                {product.category}
                            </span>
                        )}
                        {product.occasion && (
                            <span className="badge bg-brass-50 text-brass-700 border border-brass-200">
                                {product.occasion}
                            </span>
                        )}
                        {product.setCount > 1 && (
                            <span className="badge bg-linen text-ink">
                                {isHindi ? `${product.setCount} चूड़ियों का सेट` : `Set of ${product.setCount} Bangles`}
                            </span>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink leading-tight">
                            {isHindi && product.nameHi ? product.nameHi : product.name}
                        </h1>
                        {isHindi && product.nameHi && (
                            <p className="text-sm text-umber mt-1">{product.name}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <PriceTag amount={product.price} compareAtPrice={product.compareAtPrice} className="text-3xl" />
                        {product.averageRating > 0 && (
                            <div className="flex items-center gap-1.5">
                                <StarRating rating={Math.round(product.averageRating)} size={16} />
                                <span className="text-xs text-umber font-medium">
                                    ({product.numReviews} reviews)
                                </span>
                            </div>
                        )}
                    </div>

                    {product.description && (
                        <p className="text-umber leading-relaxed text-sm sm:text-base">{product.description}</p>
                    )}

                    {/* Specs Strip */}
                    <div className="grid grid-cols-2 gap-3 bg-white border border-parchment rounded-xl p-4 text-sm">
                        <div>
                            <span className="text-xs text-umber block">{isHindi ? "सामग्री (Material)" : "Material"}</span>
                            <span className="font-semibold text-ink">{product.material || "Handcrafted"}</span>
                        </div>
                        <div>
                            <span className="text-xs text-umber block">{isHindi ? "दुकान" : "Artisan Shop"}</span>
                            <span className="font-semibold text-ink inline-flex items-center gap-1">
                                <Store size={14} className="text-sindoor-600" />
                                {product.owner?.companyName || product.owner?.name || "Bangels Verse"}
                            </span>
                        </div>
                    </div>

                    {/* Size Picker */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-ink">{t("selectSize")}</span>
                            <button
                                type="button"
                                onClick={openSizeGuide}
                                className="text-xs font-semibold text-sindoor-700 hover:underline inline-flex items-center gap-1"
                            >
                                <Ruler size={14} /> {t("sizeGuideLink")}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelectedSize(s)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                                        selectedSize === s
                                            ? "bg-sindoor-600 text-white border-sindoor-600"
                                            : "bg-white text-ink border-parchment hover:border-sindoor-400"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stock + Quantity */}
                    <div className="flex flex-wrap items-center gap-5">
                        <div>
                            <span className="text-xs text-umber block mb-1">{t("quantity")}</span>
                            <div className="flex items-center bg-white border border-parchment rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    aria-label="Decrease quantity"
                                    className="w-11 h-11 flex items-center justify-center hover:bg-linen"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-11 text-center font-bold tabular-nums">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                                    aria-label="Increase quantity"
                                    className="w-11 h-11 flex items-center justify-center hover:bg-linen"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="text-sm">
                            {product.stock > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                    <CheckCircle2 size={16} /> {product.stock} {t("inStock")}
                                </span>
                            ) : (
                                <span className="text-red-600 font-semibold">{t("outOfStock")}</span>
                            )}
                            <p className="text-xs text-umber mt-0.5 flex items-center gap-1">
                                <ShieldCheck size={13} /> {isHindi ? "घर पहुँचने पर नकद भुगतान उपलब्ध" : "Cash on Delivery available"}
                            </p>
                        </div>
                    </div>

                    {/* Primary CTAs */}
                    {product.stock > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => openQuickOrder(product, selectedSize, quantity)}
                                    className="btn-primary flex-1 text-base py-3.5"
                                >
                                    <Zap size={18} />
                                    {t("orderNow")} — ₹{(product.price * quantity).toLocaleString("en-IN")}
                                </button>

                                {(!user || user.role === "user") && (
                                    <button
                                        type="button"
                                        onClick={() => addToCart(product._id, quantity, selectedSize)}
                                        className="btn-secondary py-3.5"
                                    >
                                        <ShoppingBag size={18} />
                                        {t("addToBag")}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp text-sm">
                                    <MessageCircle size={17} /> {t("whatsappOrder")}
                                </a>
                                <a href={`tel:${product.owner?.phone || storeConfig.supportPhone}`} className="btn-secondary text-sm">
                                    <Phone size={16} /> {isHindi ? "दुकान पर कॉल करें" : "Call Shop"}
                                </a>
                                {user && product.owner?._id && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const { data } = await chatAPI.startConversation({
                                                    ownerId: product.owner._id,
                                                    productId: product._id,
                                                });
                                                navigate(`/chat/${data.data._id}`);
                                            } catch (err) {
                                                toast.error(err.response?.data?.message || "Could not start chat");
                                            }
                                        }}
                                        className="btn-brass text-sm col-span-2 sm:col-span-1"
                                    >
                                        <MessageCircle size={16} /> {isHindi ? "दुकान से चैट करें" : "Chat with Shop"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Bangles */}
            {product.related?.length > 0 && (
                <section className="mt-16 pt-10 border-t border-parchment">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mb-6">
                        {isHindi ? "मिलते-जुलते अन्य डिज़ाइन" : "You May Also Like"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {product.related.map((rel) => (
                            <ProductCard key={rel._id} product={rel} />
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews */}
            <section className="mt-16 pt-10 border-t border-parchment max-w-3xl">
                <h2 className="text-2xl font-serif font-bold text-ink mb-6">
                    {isHindi ? "ग्राहकों की राय" : "Customer Reviews"} ({reviews.length})
                </h2>

                {user?.role === "user" && (
                    <form onSubmit={handleSubmitReview} className="card p-5 mb-6 space-y-4">
                        <h3 className="font-semibold text-ink">{isHindi ? "अपनी राय लिखें" : "Write a Review"}</h3>
                        <StarRating rating={rating} onChange={setRating} size={22} />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={isHindi ? "चूड़ियों की क्वालिटी कैसी लगी?" : "Share how the bangles look and fit..."}
                            className="input-field min-h-[90px] resize-none"
                        />
                        <button type="submit" disabled={submitting} className="btn-primary text-sm">
                            {submitting ? "Submitting..." : isHindi ? "राय भेजें" : "Submit Review"}
                        </button>
                    </form>
                )}

                {reviews.length === 0 ? (
                    <p className="text-sm text-umber">
                        {isHindi ? "अभी कोई समीक्षा नहीं है।" : "No reviews yet."}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((r) => (
                            <div key={r._id} className="card p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-ink text-sm">{r.user?.name || "Customer"}</span>
                                    <StarRating rating={r.rating} size={14} />
                                </div>
                                {r.comment && <p className="text-sm text-umber">{r.comment}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
