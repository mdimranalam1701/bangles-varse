import mongoose from "mongoose";
import { Product } from "./product.model.js";
import { AppError } from "../../utils/errors.js";

const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (data, userId) => {
    const images = Array.isArray(data.images) && data.images.length > 0
        ? data.images.filter(Boolean)
        : data.image
            ? [data.image]
            : [];

    const primaryImage = data.image || images[0] || "";
    const product = await Product.create({
        ...data,
        image: primaryImage,
        images,
        sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ["2.4", "2.6", "2.8"],
        owner: userId,
    });

    return product;
};

export const getAllProducts = async (query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = { isActive: { $ne: false } };

    if (query.search) {
        const rx = new RegExp(escapeRegex(query.search.trim()), "i");
        filter.$or = [
            { name: rx },
            { nameHi: rx },
            { category: rx },
            { material: rx },
            { occasion: rx },
            { description: rx },
        ];
    }

    if (query.category && query.category !== "All") {
        filter.category = new RegExp(`^${escapeRegex(query.category.trim())}$`, "i");
    }

    if (query.material && query.material !== "All") {
        filter.material = new RegExp(escapeRegex(query.material.trim()), "i");
    }

    if (query.occasion && query.occasion !== "All") {
        filter.occasion = new RegExp(`^${escapeRegex(query.occasion.trim())}$`, "i");
    }

    if (query.size) {
        filter.sizes = query.size;
    }

    if (query.inStock === "true") {
        filter.stock = { $gt: 0 };
    }

    if (query.featured === "true") {
        filter.isFeatured = true;
    }

    if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice !== undefined && query.minPrice !== "") {
            filter.price.$gte = Number(query.minPrice);
        }
        if (query.maxPrice !== undefined && query.maxPrice !== "") {
            filter.price.$lte = Number(query.maxPrice);
        }
    }

    if (query.owner) {
        if (mongoose.Types.ObjectId.isValid(query.owner)) {
            filter.owner = query.owner;
        }
    }

    const sortMap = {
        newest: { createdAt: -1 },
        price_asc: { price: 1, createdAt: -1 },
        price_desc: { price: -1, createdAt: -1 },
        rating: { averageRating: -1, numReviews: -1, createdAt: -1 },
        featured: { isFeatured: -1, createdAt: -1 },
    };
    const sortBy = sortMap[query.sort] || sortMap.newest;

    const [products, totalProducts] = await Promise.all([
        Product.find(filter)
            .populate("owner", "name companyName city phone whatsappNumber")
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    return {
        products,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalProducts / limit)),
        totalProducts,
    };
};

export const getProductById = async (productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product id", 400, "INVALID_ID");
    }

    const product = await Product.findById(productId)
        .populate("owner", "name companyName phone whatsappNumber address city bio")
        .lean();

    if (!product) {
        throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const related = await Product.find({
        _id: { $ne: product._id },
        isActive: { $ne: false },
        category: product.category,
    })
        .populate("owner", "name companyName")
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(4)
        .lean();

    return {
        ...product,
        related,
    };
};

export const getCategorySummary = async () => {
    const summary = await Product.aggregate([
        { $match: { isActive: { $ne: false } } },
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
                sampleImage: { $first: "$image" },
            },
        },
        { $sort: { count: -1 } },
    ]);

    return summary.map((item) => ({
        category: item._id || "Uncategorized",
        count: item.count,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        sampleImage: item.sampleImage,
    }));
};

export const getOwnerProducts = async (ownerId) => {
    return await Product.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
};

export const updateProduct = async (productId, data, user) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const isOwner = product.owner.toString() === user._id.toString();
    if (!isOwner && user.role !== "admin") {
        throw new AppError("Not authorized to update this product", 403, "FORBIDDEN");
    }

    const allowedFields = [
        "name",
        "nameHi",
        "description",
        "price",
        "compareAtPrice",
        "category",
        "material",
        "occasion",
        "sizes",
        "setCount",
        "stock",
        "image",
        "images",
        "sku",
        "isFeatured",
        "isActive",
    ];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            product[field] = data[field];
        }
    }

    if (data.images && Array.isArray(data.images) && data.images.length > 0 && !data.image) {
        product.image = data.images[0];
    } else if (data.image && (!product.images || product.images.length === 0)) {
        product.images = [data.image];
    }

    await product.save();
    return product;
};

export const deleteProduct = async (productId, user) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const isOwner = product.owner.toString() === user._id.toString();
    if (!isOwner && user.role !== "admin") {
        throw new AppError("Not authorized to delete this product", 403, "FORBIDDEN");
    }

    await product.deleteOne();
    return { message: "Product deleted" };
};
