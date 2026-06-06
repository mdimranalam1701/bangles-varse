import * as categoryService from "./category.service.js";

export const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const includeInactive = req.user?.role === "admin";
        const categories = await categoryService.getAllCategories(includeInactive);
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getPublicCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories(false);
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ success: true, message: "Category deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const toggleCategory = async (req, res) => {
    try {
        const category = await categoryService.toggleCategory(req.params.id);
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
