import express from "express";
import { z } from "zod";
import { register, login, getProfile, updateProfile } from "./auth.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    password: z.string().min(4, "PIN / Password must be at least 4 characters").max(100),
    role: z.enum(["user", "owner"]).optional().default("user"),
    companyName: z.string().trim().max(120).optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(80).optional(),
    pincode: z.string().trim().max(12).optional(),
    preferredLanguage: z.enum(["en", "hi"]).optional(),
});

const loginSchema = z.object({
    identifier: z.string().trim().min(3).optional(),
    email: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    password: z.string().min(1, "Password or PIN is required"),
});

const profileUpdateSchema = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().max(20).optional(),
    whatsappNumber: z.string().trim().max(20).optional(),
    bio: z.string().trim().max(500).optional(),
    companyName: z.string().trim().max(120).optional(),
    address: z.string().trim().max(300).optional(),
    city: z.string().trim().max(80).optional(),
    pincode: z.string().trim().max(12).optional(),
    profilePicture: z.string().trim().max(1000).optional(),
    preferredLanguage: z.enum(["en", "hi"]).optional(),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", isAuth, getProfile);
router.put("/profile", isAuth, validate(profileUpdateSchema), updateProfile);

export default router;
