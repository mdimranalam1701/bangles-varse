import express from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getOwnerProducts,
} from "./product.controller.js";

import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = express.Router();

// owner only - create product (requires approval)
router.post("/", isAuth, authorizeRoles("owner"), createProduct);

// public
router.get("/", getProducts);

// owner - get own products
router.get("/owner", isAuth, authorizeRoles("owner"), getOwnerProducts);

// owner only - update product
router.put("/:id", isAuth, authorizeRoles("owner"), updateProduct);

// owner only - delete product
router.delete("/:id", isAuth, authorizeRoles("owner"), deleteProduct);

export default router;