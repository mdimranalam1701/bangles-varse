import { Category } from "./category.model.js";

const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

export const createCategory = async (data) => {
    const slug = generateSlug(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) throw new Error("Category already exists");
    return await Category.create({ ...data, slug });
};

export const getAllCategories = async (includeInactive = false) => {
    const query = includeInactive ? {} : { isActive: true };
    return await Category.find(query).sort({ sortOrder: 1, name: 1 });
};

export const getCategoryBySlug = async (slug) => {
    return await Category.findOne({ slug, isActive: true });
};

export const updateCategory = async (id, data) => {
    if (data.name) data.slug = generateSlug(data.name);
    return await Category.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCategory = async (id) => {
    return await Category.findByIdAndDelete(id);
};

export const toggleCategory = async (id) => {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    category.isActive = !category.isActive;
    await category.save();
    return category;
};

export const updateProductCount = async (categoryName) => {
    const { Product } = await import("../product/product.model.js");
    const count = await Product.countDocuments({ category: categoryName });
    await Category.findOneAndUpdate({ name: categoryName }, { productCount: count });
};
