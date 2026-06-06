import bcrypt from "bcryptjs";
import { User } from "../modules/auth/user.model.js";

const ADMIN_EMAIL = "admin@bangelsverse.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME = "Super Admin";

export const seedAdmin = async () => {
    try {
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            return; // Admin already exists, skip
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
            isApproved: true,
        });

        console.log("✅ Admin user created:", ADMIN_EMAIL);
    } catch (err) {
        console.error("❌ Failed to seed admin:", err.message);
    }
};
