import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiArrowLeft, FiUser, FiMessageCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { productAPI, reviewAPI, chatAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { StarRating, LoadingSpinner, PriceTag, StatusBadge } from "../components/UI";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // Review form
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await productAPI.getAll({ search: id });
            // If no specific endpoint, fetch all and find
            const allProducts = data.data?.products || [];
            const found = allProducts.find((p) => p._id === id);
            if (found) {
                setProduct(found);
            } else {
                // Try fetching all and finding
                const { data: allData } = await productAPI.getAll({ limit: 100 });
                const p = allData.data?.products?.find((x) => x._id === id);
                setProduct(p || null);
            }
        } catch {
            setProduct(null);
        }
        setLoading(false);
    };

    const fetchReviews = async () => {
        try {
            const { data } = await reviewAPI.get(id);
            setReviews(data.data || []);
        } catch {
            setReviews([]);
        }
    };

    const handleAddToCart = () => {
        addToCart(product._id, quantity);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating) {
            toast.error("Please select a rating");
            return;
        }
        setSubmitting(true);
        try {
            await reviewAPI.add(id, { rating, comment });
            toast.success("Review added!");
            setRating(0);
            setComment("");
            fetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add review");
        }
        setSubmitting(false);
    };

    if (loading) return <LoadingSpinner />;
    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <p className="text-gray-400 text-lg">Product not found</p>
                <button onClick={() => navigate("/products")} className="btn-primary mt-4">
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6 transition-colors"
            >
                <FiArrowLeft /> Back
            </button>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Image */}
                <div className="card overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-amber-50 to-amber-100">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[100px] opacity-20">💎</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div>
                    {product.category && (
                        <span className="badge bg-amber-100 text-amber-700 mb-3">{product.category}</span>
                    )}
                    <h1 className="text-3xl font-serif font-bold text-gray-900">{product.name}</h1>

                    {product.owner?.name && (
                        <p className="flex items-center gap-1 text-gray-400 mt-2">
                            <FiUser size={14} /> Sold by {product.owner.name}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                        <PriceTag amount={product.price} className="text-3xl" />
                        {product.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                                <StarRating rating={Math.round(product.averageRating)} size={18} />
                                <span className="text-gray-400 text-sm">
                                    ({product.numReviews} reviews)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="mt-4">
                        {product.stock > 0 ? (
                            <span className="text-green-600 font-medium">✓ {product.stock} in stock</span>
                        ) : (
                            <span className="text-red-500 font-medium">✗ Out of stock</span>
                        )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    {user?.role === "user" && product.stock > 0 && (
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-3 hover:bg-amber-50 transition-colors font-medium"
                                >
                                    −
                                </button>
                                <span className="px-4 py-3 font-semibold min-w-[40px] text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="px-4 py-3 hover:bg-amber-50 transition-colors font-medium"
                                >
                                    +
                                </button>
                            </div>
                            <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                                <FiShoppingCart size={18} />
                                Add to Cart
                            </button>
                        </div>
                    )}
                    {/* Chat with Shop */}
                    {user?.role === "user" && product.owner?._id && (
                        <button
                            onClick={async () => {
                                try {
                                    const { data } = await chatAPI.startConversation({ ownerId: product.owner._id, productId: product._id });
                                    navigate(`/chat/${data.data._id}`);
                                } catch { toast.error("Failed to start chat"); }
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-amber-300 text-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-all"
                        >
                            <FiMessageCircle size={18} /> Chat with Shop
                        </button>
                    )}
                    {!user && (
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                            <p className="text-amber-700">
                                <a href="/login" className="font-semibold underline">Login</a> to purchase this item
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                    Customer Reviews ({reviews.length})
                </h2>

                {/* Add Review */}
                {user?.role === "user" && (
                    <form onSubmit={handleSubmitReview} className="card p-6 mb-8">
                        <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
                        <StarRating rating={rating} onChange={setRating} size={24} />
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="input-field mt-4 min-h-[100px] resize-none"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary mt-4"
                        >
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div key={r._id} className="card p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                                        {r.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{r.user?.name || "User"}</p>
                                        <StarRating rating={r.rating} size={14} />
                                    </div>
                                </div>
                                {r.comment && <p className="text-gray-600 mt-2">{r.comment}</p>}
                                <p className="text-xs text-gray-300 mt-2">
                                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric",
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
