import express from "express";
import { register, login, getProfile, updateProfile } from "./auth.controller.js";
import { isAuth } from "../../middleware/auth.middleware.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", isAuth, getProfile);
router.put("/profile", isAuth, updateProfile);


export default router;