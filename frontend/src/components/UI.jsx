import { Star, Package, CheckCircle2, Truck, Clock, XCircle, Boxes } from "lucide-react";

export function BrandMark({ className = "w-8 h-8" }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
            <circle cx="17" cy="20" r="11" stroke="#7C1D26" strokeWidth="2.5" />
            <circle cx="23" cy="20" r="11" stroke="#9A6E1F" strokeWidth="2.2" />
            <circle cx="20" cy="11.5" r="2.2" fill="#7C1D26" />
        </svg>
    );
}

export function StarRating({ rating, onChange, size = 18 }) {
    return (
        <div className="flex items-center gap-1" role={onChange ? "radiogroup" : undefined} aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!onChange}
                    onClick={() => onChange?.(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    className={onChange ? "cursor-pointer p-0.5 hover:scale-110 transition-transform" : "cursor-default"}
                >
                    <Star
                        size={size}
                        className={
                            star <= rating
                                ? "fill-brass-500 text-brass-500"
                                : "text-parchment fill-transparent"
                        }
                    />
                </button>
            ))}
        </div>
    );
}

export function LoadingSpinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-live="polite">
            <div className="w-10 h-10 border-2 border-parchment border-t-sindoor-600 rounded-full animate-spin" />
            <p className="text-sm text-umber font-medium">{label}</p>
        </div>
    );
}

export function ProductGridSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card p-3 space-y-3 animate-pulse">
                    <div className="aspect-square bg-linen rounded-lg" />
                    <div className="h-4 bg-linen rounded w-3/4" />
                    <div className="h-3 bg-linen rounded w-1/2" />
                    <div className="h-10 bg-linen rounded-lg w-full" />
                </div>
            ))}
        </div>
    );
}

export function EmptyState({ icon: Icon = Package, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-parchment rounded-xl">
            <div className="w-14 h-14 rounded-full bg-linen flex items-center justify-center text-sindoor-600 mb-4">
                <Icon size={26} />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-ink mb-2">{title}</h3>
            <p className="text-umber text-sm mb-6 max-w-md leading-relaxed">{description}</p>
            {action}
        </div>
    );
}

export function PriceTag({ amount, compareAtPrice, className = "" }) {
    const priceNum = Number(amount || 0);
    const compareNum = Number(compareAtPrice || 0);
    const discount =
        compareNum > priceNum ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0;

    return (
        <span className={`inline-flex items-baseline gap-2 tabular-nums ${className}`}>
            <span className="font-bold text-ink">₹{priceNum.toLocaleString("en-IN")}</span>
            {discount > 0 && (
                <>
                    <span className="text-xs text-umber/60 line-through">
                        ₹{compareNum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {discount}% OFF
                    </span>
                </>
            )}
        </span>
    );
}

export function StatusBadge({ status, isHindi = false }) {
    const map = {
        pending: {
            style: "bg-brass-50 text-brass-700 border border-brass-200",
            icon: Clock,
            en: "Order Received",
            hi: "ऑर्डर मिला",
        },
        confirmed: {
            style: "bg-blue-50 text-blue-800 border border-blue-200",
            icon: CheckCircle2,
            en: "Confirmed",
            hi: "पक्का हुआ",
        },
        packed: {
            style: "bg-amber-50 text-amber-800 border border-amber-200",
            icon: Boxes,
            en: "Packed",
            hi: "पैकिंग तैयार",
        },
        shipped: {
            style: "bg-indigo-50 text-indigo-800 border border-indigo-200",
            icon: Truck,
            en: "Out for Delivery",
            hi: "रास्ते में है",
        },
        paid: {
            style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            icon: CheckCircle2,
            en: "Paid Online",
            hi: "भुगतान पूरा",
        },
        delivered: {
            style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            icon: CheckCircle2,
            en: "Delivered",
            hi: "पहुँच गया",
        },
        cancelled: {
            style: "bg-red-50 text-red-700 border border-red-200",
            icon: XCircle,
            en: "Cancelled",
            hi: "रद्द हुआ",
        },
        credit: {
            style: "bg-sindoor-50 text-sindoor-700 border border-sindoor-200",
            icon: Clock,
            en: "Khata Credit",
            hi: "दुकान खाता",
        },
        payment: {
            style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            icon: CheckCircle2,
            en: "Payment",
            hi: "भुगतान",
        },
    };

    const cfg = map[status] || {
        style: "bg-linen text-ink border border-parchment",
        icon: Package,
        en: status || "Unknown",
        hi: status || "अज्ञात",
    };
    const Icon = cfg.icon;

    return (
        <span className={`badge ${cfg.style}`}>
            <Icon size={12} />
            {isHindi ? cfg.hi : cfg.en}
        </span>
    );
}

export function OrderTimeline({ status, isHindi = false }) {
    if (status === "cancelled") {
        return (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <XCircle size={16} />
                <span>{isHindi ? "यह ऑर्डर रद्द कर दिया गया है" : "This order was cancelled"}</span>
            </div>
        );
    }

    const steps = [
        { key: "pending", en: "Received", hi: "ऑर्डर मिला" },
        { key: "confirmed", en: "Confirmed", hi: "पक्का हुआ" },
        { key: "shipped", en: "On the Way", hi: "रास्ते में" },
        { key: "delivered", en: "Delivered", hi: "पहुँच गया" },
    ];

    const rankMap = {
        pending: 0,
        paid: 1,
        confirmed: 1,
        packed: 1,
        shipped: 2,
        delivered: 3,
    };
    const currentIdx = rankMap[status] ?? 0;

    return (
        <div className="grid grid-cols-4 gap-2 pt-2">
            {steps.map((step, idx) => {
                const done = idx <= currentIdx;
                return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                        <div className="w-full flex items-center">
                            <div className={`h-1 flex-1 ${idx === 0 ? "bg-transparent" : done ? "bg-emerald-600" : "bg-parchment"}`} />
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    done
                                        ? "bg-emerald-600 text-white"
                                        : "bg-linen text-umber border border-parchment"
                                }`}
                            >
                                {done ? "✓" : idx + 1}
                            </div>
                            <div className={`h-1 flex-1 ${idx === steps.length - 1 ? "bg-transparent" : idx < currentIdx ? "bg-emerald-600" : "bg-parchment"}`} />
                        </div>
                        <span className={`text-[11px] mt-1.5 font-medium ${done ? "text-ink" : "text-umber/60"}`}>
                            {isHindi ? step.hi : step.en}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
