import * as cartService from "./cart.service.js";

// add item
export const addToCart = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(
      req.user._id,
      productId,
      quantity
    );

    res.json({
      success: true,
      data: cart,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};

// get cart
export const getCart = async (req, res) => {
  try {

    const cart = await cartService.getCart(
      req.user._id
    );

    res.json({
      success: true,
      data: cart,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// remove item
export const removeFromCart = async (req, res) => {
  try {

    const cart =
      await cartService.removeFromCart(
        req.user._id,
        req.params.productId
      );

    res.json({
      success: true,
      data: cart,
    });

  } catch (err) {

    res.status(400).json({
      success: false,
      message: err.message,
    });

  }
};