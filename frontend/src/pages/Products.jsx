import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { productAPI } from "../services/api";
import { useLang } from "../context/LangContext";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton, EmptyState } from "../components/UI";

const CATEGORIES = ["All", "Bridal", "Gold", "Lac", "Glass", "Diamond", "Silver", "Rose Gold"];
const OCCASIONS = ["All", "Bridal", "Festive", "Daily Wear", "Party", "Gift"];

export default function Products({ ownerFilter }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isHindi } = useLang();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [occasion, setOccasion] = useState("All");
    const [sort, setSort] = useState("newest");
    const [inStockOnly, setInStockOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const urlCat = searchParams.get("category") || "All";
        setCategory(urlCat);
    }, [searchParams]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        const params = { page, limit: 12, sort };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (category !== "All") params.category = category;
        if (occasion !== "All") params.occasion = occasion;
        if (inStockOnly) params.inStock = "true";
        if (ownerFilter) params.owner = ownerFilter;

        productAPI
            .getAll(params)
            .then(({ data }) => {
                if (!active) return;
                setProducts(data.data?.products || []);
                setTotalPages(data.data?.totalPages || 1);
                setTotalProducts(data.data?.totalProducts || 0);
            })
            .catch(() => {
                if (!active) return;
                setProducts([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, category, occasion, sort, inStockOnly, debouncedSearch, ownerFilter]);

    const handleCategory = (cat) => {
        setCategory(cat);
        setPage(1);
        setSearchParams(cat === "All" ? {} : { category: cat });
    };

    const resetAll = () => {
        setSearch("");
        setDebouncedSearch("");
        setCategory("All");
        setOccasion("All");
        setSort("newest");
        setInStockOnly(false);
        setPage(1);
        setSearchParams({});
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
                        {ownerFilter
                            ? isHindi ? "मेरी दुकान" : "My Shop Showcase"
                            : category !== "All"
                                ? `${category} ${isHindi ? "चूड़ियाँ" : "Bangles"}`
                                : isHindi ? "सभी चूड़ियाँ व कंगन" : "All Bangles & Kangans"}
                    </h1>
                    <p className="text-sm text-umber mt-1">
                        {totalProducts} {isHindi ? "डिज़ाइन उपलब्ध" : "handcrafted designs available"}
                    </p>
                </div>
            </div>

            {/* Search & Sort Row */}
            <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" size={18} />
                    <input
                        type="search"
                        aria-label="Search bangles"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={isHindi ? "चूड़ी का नाम, कुंदन, लाख या डिज़ाइन लिखें..." : "Search kundan, lac, bridal chooda, gold..."}
                        className="input-field !pl-10 !pr-10"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-umber hover:text-ink"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <select
                        aria-label="Sort products"
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="input-field !w-auto min-w-[170px] text-sm font-medium"
                    >
                        <option value="newest">{isHindi ? "नए डिज़ाइन पहले" : "Newest First"}</option>
                        <option value="price_asc">{isHindi ? "कम दाम पहले" : "Price: Low to High"}</option>
                        <option value="price_desc">{isHindi ? "ज्यादा दाम पहले" : "Price: High to Low"}</option>
                        <option value="rating">{isHindi ? "सबसे पसंद किए गए" : "Top Rated"}</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowFilters((v) => !v)}
                        className="btn-secondary !px-4 text-sm md:hidden"
                    >
                        <SlidersHorizontal size={16} />
                        {isHindi ? "फ़िल्टर" : "Filters"}
                    </button>
                </div>
            </div>

            {/* Category & Occasion Filters */}
            <div className={`space-y-3 mb-8 ${showFilters ? "block" : "hidden md:block"}`}>
                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                category === cat
                                    ? "bg-sindoor-600 text-white border-sindoor-600"
                                    : "bg-white text-ink border-parchment hover:border-sindoor-400"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-umber uppercase tracking-wide mr-1">
                            {isHindi ? "अवसर:" : "Occasion:"}
                        </span>
                        {OCCASIONS.map((occ) => (
                            <button
                                key={occ}
                                type="button"
                                onClick={() => { setOccasion(occ); setPage(1); }}
                                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                                    occasion === occ
                                        ? "bg-ink text-white border-ink"
                                        : "bg-white text-umber border-parchment hover:text-ink"
                                }`}
                            >
                                {occ}
                            </button>
                        ))}
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-medium text-ink cursor-pointer">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                            className="w-4 h-4 accent-sindoor-600 rounded"
                        />
                        {isHindi ? "केवल उपलब्ध दिखाएं" : "In stock only"}
                    </label>
                </div>
            </div>

            {loading ? (
                <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
                <EmptyState
                    title={isHindi ? "कोई चूड़ी नहीं मिली" : "No bangles match these filters"}
                    description={
                        isHindi
                            ? "कृपया दूसरा नाम लिखें या सभी फ़िल्टर हटाकर फिर से देखें।"
                            : "Try clearing your search or choosing another craft category."
                    }
                    action={
                        <button type="button" onClick={resetAll} className="btn-primary">
                            <RotateCcw size={16} />
                            {isHindi ? "सभी डिज़ाइन दिखाएं" : "Show All Bangles"}
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-lg font-semibold border transition-colors ${
                                        page === p
                                            ? "bg-sindoor-600 text-white border-sindoor-600"
                                            : "bg-white text-ink border-parchment hover:border-sindoor-400"
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
