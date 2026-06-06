import { Credit } from './credit.model.js';
import { createTransaction } from '../transaction/transaction.service.js';



//add credit (when user buy on credit)
export const addCredit = async (userId, ownerId, amount) => {
    let credit = await Credit.findOne({ user: userId, owner: ownerId });

    if (!credit) {
        credit = await Credit.create({
            user: userId,
            owner: ownerId,
            entries: [],
            balance: 0,
        });
    }

    credit.entries.push({
        type: "credit",
        amount,
    });


    credit.balance += amount;

    await credit.save();

    //transaction entry
    await createTransaction({
        user: userId,
        owner: ownerId,
        amount,
        type: "credit",
        note: "Order on credit",
    });

    return credit;
};

//pay credit

export const payCredit = async (userId, ownerId, amount) => {
    const credit = await Credit.findOne({ user: userId, owner: ownerId });

    if (!credit) {
        throw new Error("No credit found");
    }

    credit.entries.push({
        type: "payment",
        amount,
    });

    credit.balance -= amount;

    await credit.save();

    //transaction entry
    await createTransaction({
        user: userId,
        owner: ownerId,
        amount,
        type: "payment",
        note: "Credit payment",
    });


    return credit;
};

//get credit ledger

export const getCredit = async (userId, ownerId) => {
    return await Credit.findOne({ user: userId, owner: ownerId })
        .populate("user", "name")
        .populate("owner", "name");
};