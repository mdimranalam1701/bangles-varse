import { User } from "../auth/user.model.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { Notification } from "../notification/notification.model.js";

export const getAllUsers = async () => {
    return await User.find().select("-password").sort({ createdAt: -1 });
};

export const getUsersByRole = async (role) => {
    return await User.find({ role }).select("-password").sort({ createdAt: -1 });
};

export const approveOwner = async (ownerId) => {
    const user = await User.findById(ownerId);
    if (!user) throw new Error("User not found");
    if (user.role !== "owner") throw new Error("User is not an owner");

    user.isApproved = true;
    await user.save();

    // Send notification to owner
    await Notification.create({
        receiver: user._id,
        title: "Account Approved! 🎉",
        message: "Congratulations! Your shop account has been approved by the admin. You can now add products to your shop.",
        isread: false,
    });

    return user;
};

export const rejectOwner = async (ownerId) => {
    const user = await User.findById(ownerId);
    if (!user) throw new Error("User not found");
    if (user.role !== "owner") throw new Error("User is not an owner");

    user.isApproved = false;
    await user.save();

    // Send notification to owner
    await Notification.create({
        receiver: user._id,
        title: "Account Approval Revoked",
        message: "Your shop account approval has been revoked by the admin. Please contact support.",
        isread: false,
    });

    return user;
};

export const getAdminStats = async () => {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const approvedOwners = await User.countDocuments({ role: "owner", isApproved: true });
    const pendingOwners = await User.countDocuments({ role: "owner", isApproved: false });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const recentOrders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(10);

    const recentUsers = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        totalUsers,
        totalOwners,
        approvedOwners,
        pendingOwners,
        totalProducts,
        totalOrders,
        totalTransactions,
        recentOrders,
        recentUsers,
    };
};

export const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Cannot delete admin");

    await user.deleteOne();
    return { message: "User deleted successfully" };
};
