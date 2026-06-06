import * as paymentService from "./payment.service.js";

export const createPayment = async (
  req,
  res
) => {

  try {

    const { amount } = req.body;

    const order =
      await paymentService.createPaymentOrder(
        amount
      );

    res.json({
      success: true,
      data: order,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

export const verifyPayment = async (
  req,
  res
) => {

  try {

    const result =
      await paymentService.verifyPayment(
        req.body
      );

    res.json({
      success: result.verified,
      message: result.message,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};