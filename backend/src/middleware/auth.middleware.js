import jwt from "jsonwebtoken";
import { User } from "../modules/auth/user.model.js";


export const isAuth = async(req,res,next) =>{
    try {
        const authHeader = req.headers.authorization;



        if(!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false,
                message: "not authorized, token missing",
            });
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if(!user) {
            return res.status(401).json({
                success: false,
                message:"user not found",
            });
        }

        req.user = user; // attach user to request

        next();
    }catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
    
};


// 🛡️ ROLE MIDDLEWARE (WRITE HERE 👇)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
};