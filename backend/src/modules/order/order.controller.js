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

export const getOrder = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user._id,
      req.user.role
    );

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, note, req.user._id);
    res.json({ success: true, data: order, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await orderService.requestReturn(req.params.id, req.user._id, reason);
    res.json({ success: true, data: order, message: "Return requested" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const handleReturn = async (req, res) => {
  try {
    const { action } = req.body; // "approved" or "rejected"
    const order = await orderService.handleReturnRequest(req.params.id, action, req.user._id);
    res.json({ success: true, data: order, message: `Return ${action}` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTracking = async (req, res) => {
  try {
    const { trackingNumber, trackingUrl } = req.body;
    const order = await orderService.updateTracking(req.params.id, trackingNumber, trackingUrl);
    res.json({ success: true, data: order, message: "Tracking info updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const reorder = async (req, res) => {
  try {
    const result = await orderService.reorder(req.params.id, req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};