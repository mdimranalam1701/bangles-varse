import { User } from "../auth/user.model.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";
import { Credit } from "../credit/credit.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { Notification } from "../notification/notification.model.js";
import { emitToRoom } from "../../config/socket.js";
import { AppError } from "../../utils/errors.js";

export const getAllUsers = async () => {
    return await User.find().select("-password").sort({ createdAt: -1 }).lean();
};

export const getUsersByRole = async (role) => {
    return await User.find({ role }).select("-password").sort({ createdAt: -1 }).lean();
};

export const approveOwner = async (ownerId) => {
    const user = await User.findById(ownerId);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    if (user.role !== "owner") throw new AppError("User is not a shop owner", 400, "INVALID_ROLE");

    user.isApproved = true;
    await user.save();

    const notif = await Notification.create({
        receiver: user._id,
        title: "Shop Account Approved",
        message: "Your shop account has been approved! You can now publish bangles to the marketplace.",
        type: "approval",
        link: "/owner/dashboard",
        isread: false,
    });
    emitToRoom(`owner:${user._id.toString()}`, "accountApproved", { notification: notif });

    const obj = user.toObject();
    delete obj.password;
    return obj;
};

export const rejectOwner = async (ownerId) => {
    const user = await User.findById(ownerId);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    if (user.role !== "owner") throw new AppError("User is not a shop owner", 400, "INVALID_ROLE");

    user.isApproved = false;
    await user.save();

    await Notification.create({
        receiver: user._id,
        title: "Shop Approval Revoked",
        message: "Your shop account approval has been paused by the admin. Please contact support.",
        type: "approval",
        link: "/profile",
        isread: false,
    });

    const obj = user.toObject();
    delete obj.password;
    return obj;
};

export const getAdminStats = async () => {
    const [
        totalUsers,
        totalOwners,
        approvedOwners,
        pendingOwners,
        totalProducts,
        totalOrders,
        totalTransactions,
        revenueAgg,
        recentOrders,
        recentUsers,
    ] = await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "owner" }),
        User.countDocuments({ role: "owner", isApproved: true }),
        User.countDocuments({ role: "owner", isApproved: false }),
        Product.countDocuments(),
        Order.countDocuments(),
        Transaction.countDocuments(),
        Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
        ]),
        Order.find().populate("user", "name email phone").sort({ createdAt: -1 }).limit(10).lean(),
        User.find().select("-password").sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    return {
        totalUsers,
        totalOwners,
        approvedOwners,
        pendingOwners,
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        totalTransactions,
        recentOrders,
        recentUsers,
    };
};

export const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    if (user.role === "admin") throw new AppError("Cannot delete admin account", 403, "FORBIDDEN");

    await user.deleteOne();
    return { message: "User deleted successfully" };
};

export const getOwnerDetail = async (ownerId) => {
    const owner = await User.findById(ownerId).select("-password").lean();
    if (!owner) throw new AppError("Owner not found", 404, "USER_NOT_FOUND");

    const products = await Product.find({ owner: ownerId }).lean();
    const productIds = products.map((p) => p._id);
    const [orders, credits, transactions] = await Promise.all([
        Order.find({ $or: [{ owners: ownerId }, { "items.product": { $in: productIds } }] })
            .populate("user", "name email phone")
            .populate("items.product", "name price image")
            .sort({ createdAt: -1 })
            .lean(),
        Credit.find({ owner: ownerId }).populate("user", "name email phone").lean(),
        Transaction.find({ owner: ownerId }).populate("user", "name email").sort({ createdAt: -1 }).lean(),
    ]);

    const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOutstanding = credits.reduce((s, c) => s + (c.balance || 0), 0);

    return {
        owner,
        stats: {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue,
            totalOutstanding,
            totalCustomers: credits.length,
        },
        products,
        orders,
        credits,
        transactions,
    };
};

export const getCustomerDetail = async (customerId) => {
    const customer = await User.findById(customerId).select("-password").lean();
    if (!customer) throw new AppError("Customer not found", 404, "USER_NOT_FOUND");

    const [orders, credits, transactions] = await Promise.all([
        Order.find({ user: customerId })
            .populate({ path: "items.product", select: "name price image owner", populate: { path: "owner", select: "name companyName" } })
            .sort({ createdAt: -1 })
            .lean(),
        Credit.find({ user: customerId }).populate("owner", "name companyName").lean(),
        Transaction.find({ user: customerId }).populate("owner", "name companyName").sort({ createdAt: -1 }).lean(),
    ]);

    const totalSpent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOutstanding = credits.reduce((s, c) => s + (c.balance || 0), 0);

    return {
        customer,
        stats: { totalOrders: orders.length, totalSpent, totalOutstanding, totalShops: credits.length },
        orders,
        credits,
        transactions,
    };
};

export const getOwnersSummary = async () => {
    const owners = await User.find({ role: "owner" }).select("-password").sort({ createdAt: -1 }).lean();
    return await Promise.all(
        owners.map(async (owner) => {
            const products = await Product.find({ owner: owner._id }).select("_id").lean();
            const productIds = products.map((p) => p._id);
            const [orders, credits] = await Promise.all([
                Order.find({ $or: [{ owners: owner._id }, { "items.product": { $in: productIds } }], status: { $ne: "cancelled" } }).lean(),
                Credit.find({ owner: owner._id }).lean(),
            ]);
            const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
            const outstanding = credits.reduce((s, c) => s + (c.balance || 0), 0);
            return { ...owner, productCount: products.length, orderCount: orders.length, revenue, outstanding, customerCount: credits.length };
        })
    );
};

export const getCustomersSummary = async () => {
    const customers = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 }).lean();
    return await Promise.all(
        customers.map(async (customer) => {
            const [orders, credits] = await Promise.all([
                Order.find({ user: customer._id, status: { $ne: "cancelled" } }).lean(),
                Credit.find({ user: customer._id }).lean(),
            ]);
            const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
            const outstanding = credits.reduce((s, c) => s + (c.balance || 0), 0);
            return { ...customer, orderCount: orders.length, totalSpent, outstanding, shopCount: credits.length };
        })
    );
};
