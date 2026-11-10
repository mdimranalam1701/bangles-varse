import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, CreditCard, BookOpen, CheckCircle2, Phone, MapPin, User } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { orderAPI, paymentAPI, couponAPI } from "../services/api";
import { PriceTag } from "../components/UI";

export default function Checkout() {
    const { cart, fetchCart } = useCart();
    const { user } = useAuth();
    const { t, isHindi, storeConfig } = useLang();
    const navigate = useNavigate();

    const [customerName, setCustomerName] = useState(user?.name || "");
    const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
    const [line1, setLine1] = useState(user?.address || "");
    const [city, setCity] = useState(user?.city || "");
    const [pincode, setPincode] = useState(user?.pincode || "");
    const [paymentType, setPaymentType] = useState("cash");
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCoupon, setShowCoupon] = useState(false);
    const [loading, setLoading] = useState(false);
    const [idemKey] = useState(() => `co_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    useEffect(() => {
        if (user) {
            setCustomerName((v) => v || user.name || "");
            setCustomerPhone((v) => v || user.phone || "");
            setLine1((v) => v || user.address || "");
            setCity((v) => v || user.city || "");
            setPincode((v) => v || user.pincode || "");
        }
    }, [user]);

    const items = cart?.items || [];
    const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1), 0);
    const finalTotal = Math.max(0, total - (appliedCoupon?.discount || 0));

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        try {
            const { data } = await couponAPI.validate({ code: couponInput.trim(), orderAmount: total });
            setAppliedCoupon({
                code: data.data?.coupon?.code || couponInput.trim().toUpperCase(),
                discount: data.data?.discount || 0,
            });
            toast.success(`Coupon applied: ₹${data.data?.discount || 0} off!`);
        } catch (err) {
            setAppliedCoupon(null);
            toast.error(err.response?.data?.message || "Invalid coupon code");
        }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <p className="text-umber mb-4">{isHindi ? "आपका बैग खाली है" : "Your bag is empty."}</p>
                <button type="button" onClick={() => navigate("/products")} className="btn-primary">
                    {isHindi ? "चूड़ियाँ देखें" : "Browse Bangles"}
                </button>
            </div>
        );
    }

    const handleCheckout = async (e) => {
        e.preventDefault();
        const digits = customerPhone.replace(/\D/g, "");
        if (digits.length !== 10) {
            toast.error(isHindi ? "10 अंकों का मोबाइल नंबर लिखें" : "Please enter a 10-digit mobile number");
            return;
        }
        if (line1.trim().length < 3) {
            toast.error(isHindi ? "कृपया पूरा पता लिखें" : "Please enter delivery address");
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map((item) => ({
                product: item.product?._id,
                quantity: item.quantity,
                size: item.size || "2.6",
            }));

            const { data: orderData } = await orderAPI.create(
                {
                    items: orderItems,
                    paymentType,
                    couponCode: appliedCoupon?.code || undefined,
                    customerName: customerName.trim(),
                    customerPhone: digits,
                    shippingAddress: { line1: line1.trim(), city: city.trim(), pincode: pincode.trim() },
                },
                idemKey
            );

            const created = orderData.data;

            if (paymentType === "online" && storeConfig.razorpayEnabled && window.Razorpay) {
                const { data: rzpRes } = await paymentAPI.createOrder({ orderId: created._id });
                const rzp = new window.Razorpay({
                    key: rzpRes.data.keyId || storeConfig.razorpayKeyId,
                    amount: rzpRes.data.amount,
                    currency: "INR",
                    name: "Bangels Verse",
                    description: `Order ${created.orderCode}`,
                    order_id: rzpRes.data.id,
                    prefill: { name: customerName, email: user?.email || "", contact: digits },
                    theme: { color: "#7C1D26" },
                    handler: async (resp) => {
                        try {
                            await paymentAPI.verify({
                                razorpay_order_id: resp.razorpay_order_id,
                                razorpay_payment_id: resp.razorpay_payment_id,
                                razorpay_signature: resp.razorpay_signature,
                                orderId: created._id,
                            });
                            toast.success(`Payment & Order ${created.orderCode} confirmed!`);
                            await fetchCart();
                            navigate("/my-orders");
                        } catch {
                            toast.error("Payment verification failed");
                        }
                    },
                });
                rzp.open();
                setLoading(false);
                return;
            }

            toast.success(`Order ${created.orderCode} placed!`);
            await fetchCart();
            navigate("/my-orders");
        } catch (err) {
            toast.error(err.response?.data?.message || "Checkout failed");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <button
                type="button"
                onClick={() => navigate("/cart")}
                className="inline-flex items-center gap-2 text-sm text-umber hover:text-sindoor-700 mb-6"
            >
                <ArrowLeft size={16} /> {isHindi ? "बैग पर वापस जाएं" : "Back to Bag"}
            </button>

            <h1 className="text-3xl font-serif font-bold text-ink mb-6">
                {isHindi ? "डिलीवरी और भुगतान" : "Delivery & Checkout"}
            </h1>

            <form onSubmit={handleCheckout} className="space-y-6">
                {/* Address */}
                <div className="card p-6 space-y-4">
                    <h2 className="font-serif font-bold text-xl text-ink">
                        {isHindi ? "1. कहाँ भेजना है?" : "1. Where should we deliver?"}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">{t("yourName")} *</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">{t("mobileNumber")} *</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/60" />
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="9876543210"
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-ink mb-1">{t("deliveryAddress")} *</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3.5 top-3.5 text-umber/60" />
                                <input
                                    type="text"
                                    value={line1}
                                    onChange={(e) => setLine1(e.target.value)}
                                    placeholder={isHindi ? "मकान नं, गली, मोहल्ला या गाँव" : "House no, street, landmark, village"}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">{t("cityLabel")}</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-ink mb-1">{t("pincodeLabel")}</label>
                            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Items Summary */}
                <div className="card p-6">
                    <h2 className="font-serif font-bold text-xl text-ink mb-3">
                        {isHindi ? "2. चुनी हुई चूड़ियाँ" : "2. Your Bangles"}
                    </h2>
                    <div className="divide-y divide-parchment/70">
                        {items.map((item) => (
                            <div key={`${item.product?._id}-${item.size}`} className="py-2.5 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-ink">{item.product?.name}</p>
                                    <p className="text-xs text-umber">
                                        Size {item.size || "2.6"} × {item.quantity}
                                    </p>
                                </div>
                                <PriceTag amount={(item.product?.price || 0) * item.quantity} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-parchment mt-3 pt-3 space-y-2">
                        {appliedCoupon && (
                            <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                                <span>Coupon ({appliedCoupon.code})</span>
                                <span>−₹{appliedCoupon.discount.toLocaleString("en-IN")}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-baseline">
                            <span className="font-bold text-ink">{isHindi ? "कुल राशि" : "Total Payable"}</span>
                            <PriceTag amount={finalTotal} className="text-xl" />
                        </div>
                        <div className="pt-1">
                            {!showCoupon ? (
                                <button
                                    type="button"
                                    onClick={() => setShowCoupon(true)}
                                    className="text-xs font-semibold text-sindoor-700 hover:underline"
                                >
                                    {isHindi ? "कूपन कोड है?" : "Have a promo / coupon code?"}
                                </button>
                            ) : (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter coupon code"
                                        className="input-field !min-h-[38px] !py-1.5 text-sm flex-1"
                                    />
                                    <button type="button" onClick={handleApplyCoupon} className="btn-secondary !py-1.5 !px-4 !min-h-[38px] text-xs">
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="card p-6 space-y-3">
                    <h2 className="font-serif font-bold text-xl text-ink">
                        {isHindi ? "3. पैसे कैसे देंगे?" : "3. Payment Method"}
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setPaymentType("cash")}
                            className={`p-4 rounded-xl border text-left transition-colors ${
                                paymentType === "cash" ? "border-sindoor-600 bg-sindoor-50/70" : "border-parchment bg-white"
                            }`}
                        >
                            <Banknote size={22} className="text-sindoor-600 mb-2" />
                            <p className="font-bold text-sm text-ink">{t("codTitle")}</p>
                            <p className="text-xs text-umber mt-0.5">{t("codDesc")}</p>
                        </button>

                        {storeConfig.razorpayEnabled && (
                            <button
                                type="button"
                                onClick={() => setPaymentType("online")}
                                className={`p-4 rounded-xl border text-left transition-colors ${
                                    paymentType === "online" ? "border-sindoor-600 bg-sindoor-50/70" : "border-parchment bg-white"
                                }`}
                            >
                                <CreditCard size={22} className="text-sindoor-600 mb-2" />
                                <p className="font-bold text-sm text-ink">{t("onlineTitle")}</p>
                                <p className="text-xs text-umber mt-0.5">{t("onlineDesc")}</p>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setPaymentType("credit")}
                            className={`p-4 rounded-xl border text-left transition-colors ${
                                paymentType === "credit" ? "border-sindoor-600 bg-sindoor-50/70" : "border-parchment bg-white"
                            }`}
                        >
                            <BookOpen size={22} className="text-brass-600 mb-2" />
                            <p className="font-bold text-sm text-ink">{t("khataTitle")}</p>
                            <p className="text-xs text-umber mt-0.5">{t("khataDesc")}</p>
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4">
                    <CheckCircle2 size={18} />
                    {loading ? t("placingOrder") : `${t("confirmOrder")} — ₹${finalTotal.toLocaleString("en-IN")}`}
                </button>
            </form>
        </div>
    );
}
