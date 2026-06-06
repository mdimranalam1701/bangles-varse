import express from "express";
import cors from "cors";

//import middleware
import { isAuth, authorizeRoles } from "./middleware/auth.middleware.js";

import productRoutes from "./modules/product/product.routes.js";
import orderRoutes from "./modules/order/order.route.js";
import creditRoutes from "./modules/credit/credit.route.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import transactionRoutes from "./modules/transaction/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";



const app = express();

//middleware
app.use(express.json());
app.use(cors());

//test route
app.get("/", (req, res) => {
    res.send("API is running");
});


//logged-in user
app.get("./api/test/user", isAuth, (req, res) => {
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


app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/credit", creditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments",paymentRoutes);

export default app;