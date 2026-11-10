import { User } from "../auth/user.model.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";
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
