import { Transaction } from "./transaction.model.js";

export const createTransaction = async ({
    user,
    owner,
    amount,
    type,
    note,
}) =>{
    return await Transaction.create({
        user,
        owner,
        amount,
        type,
        note
    });
};

export const getUserTransactions = async (userId) =>{
    return await Transaction.find({
        user: userId,
    })
    .populate("owner","name")
    .sort({ createdAt: -1});
};

export const getAllTransaction = async() =>{
    return await Transaction.find()
    .populate("user","name")
    .populate("owner","name")
    .sort({createdAt: -1});
};
