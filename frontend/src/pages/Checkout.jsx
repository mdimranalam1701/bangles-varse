import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiDollarSign, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { creditAPI, orderAPI, paymentAPI } from "../services/api";
import { PriceTag } from "../components/UI";
import { FiClock } from "react-icons/fi";

export default function Checkout() {
    const { cart, fetchCart } = useCart();
    const navigate = useNavigate();
    const [paymentType, setPaymentType] = useState("cash");
    const [loading, setLoading] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState(null);
    const [checkingApproval, setCheckingApproval] = useState(false);

    const items = cart?.items || [];
    const total = items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    const ownerField = items.length > 0 ? items[items.length - 1].product?.owner : null;
    const ownerId = ownerField?._id || ownerField || null;

    const checkApproval = async () => {
        if (!ownerId) {
            setApprovalStatus("no_owner");
            return;
        }
        setCheckingApproval(true);
        try {
            const { data } = await creditAPI.getApprovalStatus(ownerId);
            setApprovalStatus(data.data?.status || null);
        } catch {
            setApprovalStatus(null);
        }
        setCheckingApproval(false);
    };

    const handleRequestApproval = async () => {
        if (!ownerId) {
            toast.error("Unable to identify shop owner. Please try removing and re-adding items to your cart.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await creditAPI.requestApproval({ ownerId });
            setApprovalStatus(data.data?.status || "pending");
            toast.success("Approval request sent to shop owner!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to request approval");
        }
        setLoading(false);
    };

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setLoading(true);
        try {
            // Create order
            const orderItems = items.map((item) => ({
                product: item.product?._id,
                quantity: item.quantity,
            }));

            const { data: orderData } = await orderAPI.create({
                items: orderItems,
                paymentType,
            });

            const orderId = orderData.data?._id;

            if (paymentType === "cash" || paymentType === "buy_on_credit") {
                toast.success("Order placed successfully!");
                await fetchCart();
                navigate("/my-orders");
            } else if (paymentType === "credit") {
                // Online payment via Razorpay
                const { data: razorpayOrder } = await paymentAPI.createOrder({ amount: total });

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SmS16ISLrPkOcg",
                    amount: razorpayOrder.data?.amount,
                    currency: "INR",
                    name: "Bangels Verse",
                    description: "Order Payment",
                    order_id: razorpayOrder.data?.id,
                    handler: async (response) => {
                        try {
                            const { data: verifyData } = await paymentAPI.verify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId,
                            });

                            if (verifyData.success) {
                                toast.success("Payment successful!");
                                await fetchCart();
                                navigate("/my-orders");
                            } else {
                                toast.error("Payment verification failed");
                            }
                        } catch {
                            toast.error("Payment verification failed");
                        }
                    },
                    prefill: {
                        name: "",
                        email: "",
                    },
                    theme: {
                        color: "#f59e0b",
                    },
                };

                if (window.Razorpay) {
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    // Load Razorpay script dynamically
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => {
                        const rzp = new window.Razorpay(options);
                        rzp.open();
                    };
                    document.body.appendChild(script);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Checkout failed");
        }
        setLoading(false);
    };

    if (items.length === 0) {
        navigate("/cart");
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gold-600 mb-6 transition-colors group"
            >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
            </button>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Checkout</h1>

            {/* Steps indicator */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <span className="text-sm font-semibold text-gold-700">Review</span>
                </div>
                <div className="flex-1 h-0.5 bg-gold-200 rounded-full" />
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gold-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <span className="text-sm font-semibold text-gold-700">Payment</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200 rounded-full" />
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <span className="text-sm font-medium text-gray-400">Confirm</span>
                </div>
            </div>

            {/* Order Items */}
            <div className="card p-6 mb-6 !shadow-lg !shadow-gold-100/20 border border-gold-100/30">
                <h3 className="font-serif font-semibold text-lg text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 bg-gold-100 rounded-lg flex items-center justify-center text-gold-600 text-sm">📦</span>
                    Order Items
                </h3>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item._id || item.product?._id} className="flex justify-between items-center py-3 border-b border-gold-50 last:border-0">
                            <div>
                                <p className="font-medium text-gray-700">{item.product?.name}</p>
                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <PriceTag amount={(item.product?.price || 0) * item.quantity} className="font-bold" />
                        </div>
                    ))}
                </div>
                <div className="border-t border-gold-100 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-800">Total</span>
                    <PriceTag amount={total} className="text-2xl" />
                </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6 mb-6 !shadow-lg !shadow-gold-100/20 border border-gold-100/30">
                <h3 className="font-serif font-semibold text-lg text-gray-800 mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 bg-gold-100 rounded-lg flex items-center justify-center text-gold-600 text-sm">💳</span>
                    Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => setPaymentType("cash")}
                        className={`relative p-5 rounded-xl border-2 text-center transition-all duration-300 ${
                            paymentType === "cash"
                                ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-100/50"
                                : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30"
                        }`}
                    >
                        {paymentType === "cash" && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                        <FiDollarSign size={28} className={`mx-auto mb-2 ${paymentType === "cash" ? "text-gold-600" : "text-gray-400"}`} />
                        <span className={`font-semibold ${paymentType === "cash" ? "text-gold-700" : "text-gray-600"}`}>
                            Cash on Delivery
                        </span>
                    </button>
                    <button
                        onClick={() => setPaymentType("credit")}
                        className={`relative p-5 rounded-xl border-2 text-center transition-all duration-300 ${
                            paymentType === "credit"
                                ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-100/50"
                                : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30"
                        }`}
                    >
                        {paymentType === "credit" && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                        <FiCreditCard size={28} className={`mx-auto mb-2 ${paymentType === "credit" ? "text-gold-600" : "text-gray-400"}`} />
                        <span className={`font-semibold ${paymentType === "credit" ? "text-gold-700" : "text-gray-600"}`}>
                            Pay Online
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setPaymentType("buy_on_credit");
                            if (approvalStatus === null) checkApproval();
                        }}
                        className={`relative p-5 rounded-xl border-2 text-center transition-all duration-300 ${
                            paymentType === "buy_on_credit"
                                ? "border-gold-500 bg-gold-50 shadow-md shadow-gold-100/50"
                                : "border-gray-200 hover:border-gold-300 hover:bg-gold-50/30"
                        }`}
                    >
                        {paymentType === "buy_on_credit" && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        )}
                        <FiClock size={28} className={`mx-auto mb-2 ${paymentType === "buy_on_credit" ? "text-gold-600" : "text-gray-400"}`} />
                        <span className={`font-semibold ${paymentType === "buy_on_credit" ? "text-gold-700" : "text-gray-600"}`}>
                            Buy on Credit
                        </span>
                    </button>
                </div>
                {paymentType === "credit" && (
                    <p className="text-sm text-gray-400 mt-3">
                        💡 You'll be redirected to Razorpay for secure payment.
                    </p>
                )}
                {paymentType === "buy_on_credit" && (
                    <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        {checkingApproval ? (
                            <p className="text-sm text-gray-500">Checking approval status...</p>
                        ) : approvalStatus === "no_owner" ? (
                            <p className="text-sm text-red-500">⚠️ Could not identify the shop owner. Please re-add your items to the cart and try again.</p>
                        ) : approvalStatus === "approved" ? (
                            <p className="text-sm text-green-600 font-medium">✓ You are approved to buy on credit from this shop.</p>
                        ) : approvalStatus === "pending" ? (
                            <p className="text-sm text-amber-600 font-medium">⏳ Your credit request is pending approval from the shop owner.</p>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">You need approval from the shop owner to buy on credit.</p>
                                <button onClick={handleRequestApproval} disabled={loading} className="btn-secondary w-full py-2">
                                    {loading ? "Sending..." : "Request Credit Approval"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {paymentType === "buy_on_credit" && approvalStatus !== "approved" ? null : (
                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn-primary w-full text-lg"
                >
                    {loading
                        ? "Processing..."
                        : paymentType === "cash" || paymentType === "buy_on_credit"
                            ? `Place Order — ₹${total.toLocaleString("en-IN")}`
                            : `Pay ₹${total.toLocaleString("en-IN")}`}
                </button>
            )}
        </div>
    );
}
