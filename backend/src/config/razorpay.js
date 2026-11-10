import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

export const isRazorpayConfigured = () =>
    Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const getRazorpay = () => {
    if (!isRazorpayConfigured()) {
        return null;
    }
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

export default getRazorpay;
