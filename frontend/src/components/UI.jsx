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
        <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin" />
                <p className="text-gray-400 font-medium">Loading...</p>
            </div>
        </div>
    );
}

export function EmptyState({ icon = "📦", title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">{icon}</span>
            <h3 className="text-xl font-serif font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-400 mb-6 max-w-md">{description}</p>
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
        pending: "bg-yellow-100 text-yellow-700",
        paid: "bg-green-100 text-green-700",
        delivered: "bg-blue-100 text-blue-700",
        credit: "bg-purple-100 text-purple-700",
        payment: "bg-green-100 text-green-700",
    };

    return (
        <span className={`badge ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
}
