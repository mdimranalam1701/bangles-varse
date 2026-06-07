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

// Get detailed info about a specific owner
export const getOwnerDetail = async (ownerId) => {
    const owner = await User.findById(ownerId).select("-password");
    if (!owner) throw new Error("Owner not found");

    const products = await Product.find({ owner: ownerId });
    const productIds = products.map(p => p._id);

    // Orders don't have owner field - find through products
    const orders = await Order.find({ "items.product": { $in: productIds } })
        .populate("user", "name email phone")
        .populate("items.product", "name price image")
        .sort({ createdAt: -1 });
    const credits = await Credit.find({ owner: ownerId })
        .populate("user", "name email phone");
    const transactions = await Transaction.find({ owner: ownerId })
        .populate("user", "name email")
        .sort({ createdAt: -1 });

    const totalRevenue = orders
        .filter(o => o.status !== "cancelled")
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const totalCreditGiven = credits.reduce((acc, c) => {
        const creditEntries = c.entries?.filter(e => e.type === "credit") || [];
        return acc + creditEntries.reduce((s, e) => s + (e.amount || 0), 0);
    }, 0);

    const totalCreditPaid = credits.reduce((acc, c) => {
        const paymentEntries = c.entries?.filter(e => e.type === "payment") || [];
        return acc + paymentEntries.reduce((s, e) => s + (e.amount || 0), 0);
    }, 0);

    const totalOutstanding = credits.reduce((acc, c) => acc + (c.balance || 0), 0);

    return {
        owner,
        stats: {
            totalProducts: products.length,
            totalOrders: orders.length,
            totalRevenue,
            totalCreditGiven,
            totalCreditPaid,
            totalOutstanding,
            totalCustomers: credits.length,
        },
        products,
        orders,
        credits,
        transactions,
    };
};

// Get detailed info about a specific customer
export const getCustomerDetail = async (customerId) => {
    const customer = await User.findById(customerId).select("-password");
    if (!customer) throw new Error("Customer not found");

    // Orders don't have owner field - populate products to get owner info
    const orders = await Order.find({ user: customerId })
        .populate({
            path: "items.product",
            select: "name price image owner",
            populate: { path: "owner", select: "name companyName" }
        })
        .sort({ createdAt: -1 });
    const credits = await Credit.find({ user: customerId })
        .populate("owner", "name companyName");
    const transactions = await Transaction.find({ user: customerId })
        .populate("owner", "name companyName")
        .sort({ createdAt: -1 });

    const totalSpent = orders
        .filter(o => o.status !== "cancelled")
        .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const totalCreditUsed = credits.reduce((acc, c) => {
        const creditEntries = c.entries?.filter(e => e.type === "credit") || [];
        return acc + creditEntries.reduce((s, e) => s + (e.amount || 0), 0);
    }, 0);

    const totalCreditPaid = credits.reduce((acc, c) => {
        const paymentEntries = c.entries?.filter(e => e.type === "payment") || [];
        return acc + paymentEntries.reduce((s, e) => s + (e.amount || 0), 0);
    }, 0);

    const totalOutstanding = credits.reduce((acc, c) => acc + (c.balance || 0), 0);

    return {
        customer,
        stats: {
            totalOrders: orders.length,
            totalSpent,
            totalCreditUsed,
            totalCreditPaid,
            totalOutstanding,
            totalShops: credits.length,
        },
        orders,
        credits,
        transactions,
    };
};

// Get all owners with their credit summaries
export const getOwnersSummary = async () => {
    const owners = await User.find({ role: "owner" }).select("-password").sort({ createdAt: -1 });

    const summaries = await Promise.all(
        owners.map(async (owner) => {
            const productCount = await Product.countDocuments({ owner: owner._id });
            const products = await Product.find({ owner: owner._id }).select("_id");
            const productIds = products.map(p => p._id);
            const orderCount = await Order.countDocuments({ "items.product": { $in: productIds } });
            const credits = await Credit.find({ owner: owner._id });

            const ownerOrders = await Order.find({ "items.product": { $in: productIds }, status: { $ne: "cancelled" } });
            const revenue = ownerOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

            const outstanding = credits.reduce((acc, c) => acc + (c.balance || 0), 0);
            const creditGiven = credits.reduce((acc, c) => {
                return acc + (c.entries?.filter(e => e.type === "credit").reduce((s, e) => s + (e.amount || 0), 0) || 0);
            }, 0);
            const creditPaid = credits.reduce((acc, c) => {
                return acc + (c.entries?.filter(e => e.type === "payment").reduce((s, e) => s + (e.amount || 0), 0) || 0);
            }, 0);

            return {
                ...owner.toObject(),
                productCount,
                orderCount,
                revenue,
                creditGiven,
                creditPaid,
                outstanding,
                customerCount: credits.length,
            };
        })
    );

    return summaries;
};

// Get all customers with their credit summaries
export const getCustomersSummary = async () => {
    const customers = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });

    const summaries = await Promise.all(
        customers.map(async (customer) => {
            const orderCount = await Order.countDocuments({ user: customer._id });
            const credits = await Credit.find({ user: customer._id });

            const orders = await Order.find({ user: customer._id, status: { $ne: "cancelled" } });
            const totalSpent = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

            const outstanding = credits.reduce((acc, c) => acc + (c.balance || 0), 0);
            const creditUsed = credits.reduce((acc, c) => {
                return acc + (c.entries?.filter(e => e.type === "credit").reduce((s, e) => s + (e.amount || 0), 0) || 0);
            }, 0);
            const creditPaid = credits.reduce((acc, c) => {
                return acc + (c.entries?.filter(e => e.type === "payment").reduce((s, e) => s + (e.amount || 0), 0) || 0);
            }, 0);

            return {
                ...customer.toObject(),
                orderCount,
                totalSpent,
                creditUsed,
                creditPaid,
                outstanding,
                shopCount: credits.length,
            };
        })
    );

    return summaries;
};
