import { Product } from "../product/product.model.js";
import { Order } from "../order/order.model.js";
import { Credit } from "../credit/credit.model.js";
import { Transaction } from "../transaction/transaction.model.js";

export const getOwnerDashboard = async (ownerId) => {
    const products = await Product.find({ owner: ownerId }).lean();
    const productIds = products.map((p) => p._id);
    const lowStockProducts = products.filter((p) => p.stock <= 5);

    const orders = await Order.find({
        $or: [{ owners: ownerId }, { "items.product": { $in: productIds } }],
    })
        .sort({ createdAt: -1 })
        .lean();

    const activeOrders = orders.filter((o) => o.status !== "cancelled");
    const pendingOrders = orders.filter((o) => ["pending", "confirmed", "packed"].includes(o.status)).length;

    const productIdSet = new Set(productIds.map((id) => id.toString()));

    const getOwnerOrderRevenue = (order) => {
        if (!order.items || order.items.length === 0) return order.totalAmount || 0;
        const matched = order.items.filter(
            (item) =>
                item.owner?.toString() === ownerId.toString() ||
                productIdSet.has(item.product?.toString())
        );
        if (matched.length === 0) return order.totalAmount || 0;
        return matched.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    };

    const totalSales = activeOrders.reduce((sum, order) => sum + getOwnerOrderRevenue(order), 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySales = activeOrders
        .filter((o) => new Date(o.createdAt) >= startOfToday)
        .reduce((sum, order) => sum + getOwnerOrderRevenue(order), 0);

    // 7-day daily sales trend
    const dailyMap = new Map();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dailyMap.set(key, {
            date: key,
            label: d.toLocaleDateString("en-IN", { weekday: "short" }),
            sales: 0,
            orders: 0,
        });
    }
    for (const o of activeOrders) {
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        if (dailyMap.has(key)) {
            const entry = dailyMap.get(key);
            entry.sales += getOwnerOrderRevenue(o);
            entry.orders += 1;
        }
    }

    const [credits, recentTransactions] = await Promise.all([
        Credit.find({ owner: ownerId }).lean(),
        Transaction.find({ owner: ownerId })
            .populate("user", "name phone")
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(),
    ]);

    const pendingCredits = credits.reduce((sum, c) => sum + Math.max(0, c.balance || 0), 0);

    return {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5),
        totalOrders: orders.length,
        pendingOrders,
        totalSales,
        todaySales,
        pendingCredits,
        creditCustomersCount: credits.filter((c) => c.balance > 0).length,
        dailySales: Array.from(dailyMap.values()),
        recentTransactions,
    };
};
