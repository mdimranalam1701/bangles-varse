import express from "express";
import cors from "cors";

//import middleware
import { isAuth, authorizeRoles } from "./middleware/auth.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import orderRoutes from "./modules/order/order.route.js";
import creditRoutes from "./modules/credit/credit.route.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import uploadRoutes from "./modules/upload/upload.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import couponRoutes from "./modules/coupon/coupon.routes.js";
import announcementRoutes from "./modules/announcement/announcement.routes.js";
import activityLogRoutes from "./modules/activityLog/activityLog.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import payoutRoutes from "./modules/payout/payout.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";



const app = express();

//middleware
app.use(express.json());
app.use(cors());

//test route
app.get("/", (req, res) => {
    res.send("API is running");
});


//logged-in user
app.get("/api/test/user", isAuth, (req, res) => {
    res.json({
        message: "User accessed",
        user: req.user,
    });
});

//only admin
app.get("/api/test/admin", isAuth, authorizeRoles("admin"), (req, res) => {
    res.json({
        message: "admin accessed",
    });
});

//only owner
app.get("/api/test/owner", isAuth, authorizeRoles("owner"), (req, res) => {
    res.json({
        message: "Owner accessed",
    });
});


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/chat", chatRoutes);

export default app;