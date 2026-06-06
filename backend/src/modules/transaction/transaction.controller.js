import * as transactionService from "./transaction.service.js";


export const getMyTransactions = async (req, res) => {
  try {
    const transaction =
      await transactionService.getUserTransactions(req.user._id);

    res.json({ success: true, data: transaction, });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getOwnerTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getOwnerTransactions(req.user._id);
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions =
      await transactionService.getAllTransactions();

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};