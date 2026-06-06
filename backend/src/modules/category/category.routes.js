import express from "express";
import {
    createCategory,
    getCategories,
    getPublicCategories,
    updateCategory,
    deleteCategory,
    toggleCategory,
} from "./category.controller.js";
import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/public", getPublicCategories);
router.get("/", isAuth, getCategories);
router.post("/", isAuth, authorizeRoles("admin"), createCategory);
router.put("/:id", isAuth, authorizeRoles("admin"), updateCategory);
router.delete("/:id", isAuth, authorizeRoles("admin"), deleteCategory);
router.put("/:id/toggle", isAuth, authorizeRoles("admin"), toggleCategory);

export default router;
