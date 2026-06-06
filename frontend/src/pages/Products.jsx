import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import { LoadingSpinner, EmptyState } from "../components/UI";

const CATEGORIES = ["All", "Gold", "Silver", "Diamond", "Platinum", "Rose Gold"];

export default function Products({ ownerFilter }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [page, category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (search) params.search = search;
            if (category !== "All") params.category = category;
            if (ownerFilter) params.owner = ownerFilter;

            const { data } = await productAPI.getAll(params);
            setProducts(data.data?.products || []);
            setTotalPages(data.data?.totalPages || 1);
        } catch {
            setProducts([]);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleCategory = (cat) => {
        setCategory(cat);
        setPage(1);
        setSearchParams(cat === "All" ? {} : { category: cat });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                    {ownerFilter ? "🏪 My Shop" : `${category !== "All" ? category : "All"} Bangles`}
                </h1>
                <p className="text-gray-400 mt-1">
                    {ownerFilter ? "This is how customers see your shop" : "Discover our beautiful collection"}
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search bangles..."
                        className="input-field !pl-11"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => { setSearch(""); setPage(1); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </form>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-secondary flex items-center gap-2 sm:w-auto"
                >
                    <FiFilter size={16} />
                    Filters
                </button>
            </div>

            {/* Category Pills */}
            <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? "block" : "hidden sm:flex"}`}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${category === cat
                            ? "bg-gold-500 text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-gold-300 hover:text-gold-600"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {loading ? (
                <LoadingSpinner />
            ) : products.length === 0 ? (
                <EmptyState
                    icon="🔍"
                    title="No products found"
                    description="Try adjusting your search or filter to find what you're looking for."
                    action={
                        <button
                            onClick={() => { setSearch(""); setCategory("All"); setPage(1); }}
                            className="btn-primary"
                        >
                            Clear Filters
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p, i) => (
                            <div key={p._id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${page === p
                                        ? "bg-gold-500 text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gold-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
