import * as orderService from "./order.service.js";

export const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user._id);

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await orderService.getOwnerOrders(req.user._id);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};