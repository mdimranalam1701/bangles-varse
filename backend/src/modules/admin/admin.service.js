import { User } from "../auth/user.model.js";
import { Order } from "../order/order.model.js";
import { Product } from "../product/product.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { Notification } from "../notification/notification.model.js";
import { Credit } from "../credit/credit.model.js";

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
    const totalTransactionsCount = await Transaction.countDocuments();

    // Financial calculations
    const allOrders = await Order.find({ status: { $ne: "cancelled" } });
    const totalSalesAmount = allOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const allCredits = await Credit.find();
    const totalOutstandingCredit = allCredits.reduce((acc, credit) => acc + (credit.balance || 0), 0);

    const paymentTransactions = await Transaction.find({ type: "payment" });
    const totalPaymentsReceived = paymentTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

    const recentOrders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(10);

    const recentUsers = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(10);

    const recentTransactions = await Transaction.find()
        .populate("user", "name email")
        .populate("owner", "name email")
        .sort({ createdAt: -1 })
        .limit(10);

    return {
        totalUsers,
        totalOwners,
        approvedOwners,
        pendingOwners,
        totalProducts,
        totalOrders,
        totalTransactions: totalTransactionsCount,
        totalSalesAmount,
        totalOutstandingCredit,
        totalPaymentsReceived,
        recentOrders,
        recentUsers,
        recentTransactions,
    };
};

export const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.role === "admin") throw new Error("Cannot delete admin");

    await user.deleteOne();
    return { message: "User deleted successfully" };
};
