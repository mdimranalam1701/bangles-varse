import express from "express";
import { z } from "zod";
import {
    createProduct,
    getProducts,
    getProductById,
    getCategorySummary,
    deleteProduct,
    updateProduct,
    getOwnerProducts,
} from "./product.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const productSchema = z.object({
    name: z.string().trim().min(2, "Product name is required").max(150),
    nameHi: z.string().trim().max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    compareAtPrice: z.coerce.number().min(0).optional().nullable(),
    category: z.string().trim().min(1).max(60).optional(),
    material: z.string().trim().max(80).optional(),
    occasion: z.string().trim().max(80).optional(),
    sizes: z.array(z.string().trim()).optional(),
    setCount: z.coerce.number().int().min(1).max(100).optional(),
    stock: z.coerce.number().int().min(0).default(0),
    image: z.string().trim().max(1000).optional(),
    images: z.array(z.string().trim().max(1000)).optional(),
    sku: z.string().trim().max(60).optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

const productUpdateSchema = productSchema.partial();

router.get("/categories/summary", getCategorySummary);
router.get("/owner", isAuth, authorizeRoles("owner", "admin"), getOwnerProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", isAuth, authorizeRoles("owner", "admin"), validate(productSchema), createProduct);
router.put("/:id", isAuth, authorizeRoles("owner", "admin"), validate(productUpdateSchema), updateProduct);
router.delete("/:id", isAuth, authorizeRoles("owner", "admin"), deleteProduct);

export default router;
