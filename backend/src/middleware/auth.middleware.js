import jwt from "jsonwebtoken";
import { User } from "../modules/auth/user.model.js";

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    return secret;
};

export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing",
                error: { code: "UNAUTHORIZED", message: "Not authorized, token missing" },
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, getJwtSecret());
        const user = await User.findById(decoded.id).select("-password").lean();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                error: { code: "UNAUTHORIZED", message: "User not found" },
            });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session",
            error: { code: "UNAUTHORIZED", message: "Invalid or expired session" },
        });
    }
};

export const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, getJwtSecret());
            const user = await User.findById(decoded.id).select("-password").lean();
            if (user) req.user = user;
        }
    } catch {
        // Ignore invalid optional tokens
    }
    next();
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
                error: { code: "FORBIDDEN", message: "Access denied" },
            });
        }
        next();
    };
};
