import { io } from "../../server.js";

export const createOrder = async (data, userId) => {
    const { items, paymentType } = data;

    let totalAmount = 0;
    let ownerId = null;

    // calculate total
    for (let item of items) {
        const product = await Product.findById(item.product);

        if (!product) {
            throw new Error("Product not found");
        }

        totalAmount += product.price * item.quantity;

        // store owner id
        ownerId = product.owner;
    }

    const order = await Order.create({
        user: userId,
        items,
        totalAmount,
        paymentType,
    });

    io.emit("newOrder", {
        message: `New order received worth ₹${totalAmount} `
    });

    // add credit automatically
    if (paymentType === "credit") {
        await addCredit(userId, ownerId, totalAmount);
    }

    return order;
};