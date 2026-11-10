import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import cloudinary, { isCloudinaryConfigured } from "../../config/cloudinary.js";
import { isAuth } from "../../middleware/auth.middleware.js";

const router = express.Router();

const ALLOWED_MIME = new Map([
    ["image/jpeg", "jpg"],
    ["image/jpg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG, or WebP images are allowed"), false);
        }
    },
});

const UPLOADS_DIR = path.resolve("uploads");

const saveLocally = async (file) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const ext = ALLOWED_MIME.get(file.mimetype) || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOADS_DIR, filename), file.buffer);
    return `/uploads/${filename}`;
};

router.post("/", isAuth, upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        if (isCloudinaryConfigured()) {
            try {
                const b64 = req.file.buffer.toString("base64");
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;
                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "bangelsverse",
                    resource_type: "image",
                    transformation: [{ width: 900, height: 900, crop: "limit" }, { quality: "auto" }],
                });
                return res.json({
                    success: true,
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            } catch (cloudErr) {
                console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr.message);
            }
        }

        const localUrl = await saveLocally(req.file);
        return res.json({
            success: true,
            url: localUrl,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
