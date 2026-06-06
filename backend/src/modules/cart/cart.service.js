import { Cart } from "./cart.model.js";

// add to cart
export const addToCart = async (
  userId,
  productId,
  quantity
) => {

  let cart = await Cart.findOne({ user: userId });

  // create cart if not exists
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  // check existing product
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  await cart.save();

  return cart;
};

// get cart
export const getCart = async (userId) => {

  return await Cart.findOne({
    user: userId,
  }).populate("items.product");

};

// remove from cart
export const removeFromCart = async (
  userId,
  productId
) => {

  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) =>
      item.product.toString() !== productId
  );

  await cart.save();

  return cart;
};