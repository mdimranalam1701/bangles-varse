import express from "express";
import multer from "multer";
import cloudinary from "../../config/cloudinary.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Use memory storage for multer (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

// Upload image to Cloudinary
router.post("/", isAuth, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        // Convert buffer to base64 data URI for Cloudinary
        const b64 = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "bangelsverse",
            resource_type: "image",
            transformation: [
                { width: 500, height: 500, crop: "limit" },
                { quality: "auto" },
            ],
        });

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || "Upload failed",
        });
    }
});

export default router;
