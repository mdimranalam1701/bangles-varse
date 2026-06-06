import express from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
} from "./product.controller.js";

import { isAuth, authorizeRoles } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const router = express.Router();

// owner only
router.post("/", isAuth, authorizeRoles("owner"), createProduct);

// public
router.get("/", getProducts);

// owner only
router.delete("/:id", isAuth, authorizeRoles("owner"), deleteProduct);
//cloudinary
router.post("/", isAuth, authorizeRoles("owner"), createProduct);

export default router;