import { FiStar } from "react-icons/fi";

export function StarRating({ rating, onChange, size = 20 }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange?.(star)}
                    className={`transition-colors ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"
                        }`}
                >
                    <FiStar
                        size={size}
                        className={
                            star <= rating
                                ? "fill-gold-400 text-gold-400"
                                : "text-gray-300"
                        }
                    />
                </button>
            ))}
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-14 h-14 border-4 border-gold-200 rounded-full" />
                    <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-t-gold-500 rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 font-medium tracking-wide">Loading...</p>
            </div>
        </div>
    );
}

export function EmptyState({ icon = "📦", title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">{icon}</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-700 mb-3">{title}</h3>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">{description}</p>
            {action}
        </div>
    );
}

export function PriceTag({ amount, className = "" }) {
    return (
        <span className={`font-semibold text-gold-700 ${className}`}>
            ₹{Number(amount).toLocaleString("en-IN")}
        </span>
    );
}

export function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-50 text-amber-700 border border-amber-200/50",
        paid: "bg-green-50 text-green-700 border border-green-200/50",
        delivered: "bg-blue-50 text-blue-700 border border-blue-200/50",
        credit: "bg-purple-50 text-purple-700 border border-purple-200/50",
        payment: "bg-green-50 text-green-700 border border-green-200/50",
        cancelled: "bg-red-50 text-red-700 border border-red-200/50",
    };

    return (
        <span className={`badge ${styles[status] || "bg-gray-50 text-gray-700 border border-gray-200/50"} shadow-sm`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
}
