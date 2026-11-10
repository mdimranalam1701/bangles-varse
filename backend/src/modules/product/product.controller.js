import * as productService from "./product.service.js";
import { asyncHandler, AppError } from "../../utils/errors.js";

export const createProduct = asyncHandler(async (req, res) => {
    if (req.user.role === "owner" && !req.user.isApproved) {
        throw new AppError(
            "Your shop account is pending admin approval. You cannot publish products yet.",
            403,
            "OWNER_NOT_APPROVED"
        );
    }

    const product = await productService.createProduct(req.body, req.user._id);
    res.status(201).json({ success: true, data: product });
});

export const getProducts = asyncHandler(async (req, res) => {
    const data = await productService.getAllProducts(req.query);
    res.json({ success: true, data });
});

export const getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
});

export const getCategorySummary = asyncHandler(async (_req, res) => {
    const summary = await productService.getCategorySummary();
    res.json({ success: true, data: summary });
});

export const getOwnerProducts = asyncHandler(async (req, res) => {
    const products = await productService.getOwnerProducts(req.user._id);
    res.json({ success: true, data: products });
});

export const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body, req.user);
    res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id, req.user);
    res.json({ success: true, ...result });
});
