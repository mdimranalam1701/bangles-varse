import * as creditService from "./credit.service.js";


// user buys on credit

export const addCredit = async (req,res)=>{
    try{
        const {ownerId, amount} = req.body;

        const credit = await creditService.addCredit(
            req.user._id,
            ownerId,
            amount
        );

        res.json({ success: true, data:credit});
    } catch (err) {
        res.status(400).json({success: false, message: err,message});
    }
};

//user pays

export const payCredit = async (req,res) =>{
    try {
        const { ownerId, amount } = req.body;

        const credit = await creditService.payCredit(
            req.user._id,
            ownerId,
            amount,
        );

        res.json({ success: true, data: credit });
    } catch(err) {
        res.status(400).json({success: false, message: err.message});
    }
};

// view ledger
export const getCredit = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const credit = await creditService.getCredit(
      req.user._id,
      ownerId
    );

    res.json({ success: true, data: credit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
