import { Product } from "../product/product.model.js";
import { Order } from "../order/order.model.js";
import { Credit } from "../credit/credit.model.js";
import { Transaction } from "../transaction/transaction.model.js";

export const getOwnerDashboard = async (ownerId) =>{

    //total product
    const totalProducts = await Product.countDocuments({
        owner: ownerId,
    });

    //owner's products
    const products = await Product.find({
        owner: ownerId,
    });

    const productIds = products.map((p) => p._id);

    //owner orders
    const orders = await Order.find({
        "items.product": { $in: productIds},
    });

    //total sales
    const totalSales = orders.reduce(
        (sum, order) => sum +order.totalAmount,
        0
    );

    //pending credits
    const credits = await Credit.find({
        owner:  ownerId,
    });

    const pendingCredits = credits.reduce(
        (sum, credit) => sum + credit.balance, 0
    );

    //recent transactions
    const recentTransactions = await Transaction.find({
        owner: ownerId,
    })
    .sort({ createdAt:-1})
    .limit(5);


    return {
        totalProducts,
        totalOrders: orders.length,
        totalSales,
        pendingCredits,
        recentTransactions,
    };
};