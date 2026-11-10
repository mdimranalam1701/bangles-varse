import { Link } from "react-router-dom";
import { ShoppingBag, Star, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { PriceTag } from "./UI";
import { resolveAssetUrl } from "../services/api";

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { openQuickOrder, t, isHindi } = useLang();

    const title = isHindi && product.nameHi ? product.nameHi : product.name;
    const imgSrc = resolveAssetUrl(product.image || product.images?.[0]) || "/images/products/gold-kada.svg";
    const inStock = product.stock > 0;

    return (
        <article className="card group flex flex-col justify-between hover:shadow-elevated transition-all duration-300">
            <div>
                <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-linen">
                    <div className="aspect-square">
                        <img
                            src={imgSrc}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                    </div>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {product.category && (
                            <span className="badge bg-white/95 text-ink border border-parchment shadow-xs">
                                {product.category}
                            </span>
                        )}
                        {product.setCount > 1 && (
                            <span className="badge bg-ink/85 text-ivory">
                                {isHindi ? `${product.setCount} का सेट` : `Set of ${product.setCount}`}
                            </span>
                        )}
                    </div>
                    {!inStock && (
                        <span className="absolute bottom-3 left-3 badge bg-red-600 text-white">
                            {t("outOfStock")}
                        </span>
                    )}
                </Link>

                <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <Link to={`/products/${product._id}`} className="min-w-0 flex-1">
                            <h3 className="font-serif font-bold text-lg text-ink group-hover:text-sindoor-700 transition-colors line-clamp-1">
                                {title}
                            </h3>
                        </Link>
                        {product.averageRating > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink shrink-0 pt-1">
                                <Star size={13} className="fill-brass-500 text-brass-500" />
                                {Number(product.averageRating).toFixed(1)}
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-umber mt-0.5 truncate">
                        {product.material || product.owner?.companyName || product.owner?.name || "Handcrafted"}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                        <PriceTag
                            amount={product.price}
                            compareAtPrice={product.compareAtPrice}
                            className="text-base"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons: 1-Tap Order Now (always accessible!) + Add to Bag */}
            <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                <button
                    type="button"
                    disabled={!inStock}
                    onClick={() => openQuickOrder(product)}
                    className="btn-primary flex-1 !py-2.5 !px-3 text-sm"
                >
                    <Zap size={15} />
                    {inStock ? t("orderNow") : t("outOfStock")}
                </button>
                {(!user || user.role === "user") && inStock && (
                    <button
                        type="button"
                        onClick={() => addToCart(product._id, 1, product.sizes?.[0] || "2.6")}
                        aria-label={t("addToBag")}
                        title={t("addToBag")}
                        className="btn-secondary !py-2.5 !px-3"
                    >
                        <ShoppingBag size={17} />
                    </button>
                )}
            </div>
        </article>
    );
}
