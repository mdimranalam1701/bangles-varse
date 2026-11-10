import { useState, useEffect } from "react";
import {
    X,
    CheckCircle2,
    Phone,
    MessageCircle,
    Banknote,
    CreditCard,
    BookOpen,
    Ruler,
    MapPin,
    User,
    Minus,
    Plus,
    ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI, resolveAssetUrl } from "../services/api";
import { PriceTag } from "./UI";

const SIZE_INFO = {
    "2.2": "5.4 cm",
    "2.4": "5.7 cm",
    "2.6": "6.0 cm",
    "2.8": "6.4 cm",
    "2.10": "6.7 cm",
    "Free Size": "Adjustable",
};

export default function QuickOrderModal() {
    const { quickOrderState, closeQuickOrder, t, isHindi, storeConfig, openSizeGuide } = useLang();
    const { user } = useAuth();

    const product = quickOrderState?.product;
    const availableSizes = product?.sizes?.length ? product.sizes : ["2.4", "2.6", "2.8"];

    const [size, setSize] = useState("2.6");
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [line1, setLine1] = useState("");
    const [city, setCity] = useState("");
    const [paymentType, setPaymentType] = useState("cash");
    const [submitting, setSubmitting] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    const [idemKey, setIdemKey] = useState("");

    useEffect(() => {
        if (quickOrderState?.product) {
            setSize(quickOrderState.size || quickOrderState.product.sizes?.[0] || "2.6");
            setQuantity(quickOrderState.quantity || 1);
            setCustomerName(user?.name || "");
            setCustomerPhone(user?.phone || "");
            setLine1(user?.address || "");
            setCity(user?.city || "");
            setPaymentType("cash");
            setConfirmedOrder(null);
            setIdemKey(`qo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
        }
    }, [quickOrderState, user]);

    if (!product) return null;

    const total = (product.price || 0) * quantity;
    const shopWhatsapp = product.owner?.whatsappNumber || product.owner?.phone || storeConfig.supportWhatsapp;
    const whatsappClean = String(shopWhatsapp).replace(/\D/g, "");
    const whatsappHref = `https://wa.me/${whatsappClean.length === 10 ? `91${whatsappClean}` : whatsappClean}?text=${encodeURIComponent(
        `Namaste! I want to order from Bangels Verse:\n• Product: ${product.name}\n• Size: ${size}\n• Quantity: ${quantity}\n• Price: Rs.${total}\n• Name: ${customerName || "Customer"}\n• Address: ${line1 || ""} ${city || ""}`
    )}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const digits = customerPhone.replace(/\D/g, "");
        if (digits.length !== 10) {
            toast.error(isHindi ? "कृपया 10 अंकों का सही मोबाइल नंबर लिखें" : "Please enter a valid 10-digit mobile number");
            return;
        }
        if (customerName.trim().length < 2) {
            toast.error(isHindi ? "कृपया अपना नाम लिखें" : "Please enter your name");
            return;
        }
        if (line1.trim().length < 3) {
            toast.error(isHindi ? "कृपया डिलीवरी का पता लिखें" : "Please enter your delivery address");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                customerName: customerName.trim(),
                customerPhone: digits,
                shippingAddress: { line1: line1.trim(), city: city.trim() },
                paymentType,
                items: [{ product: product._id, quantity, size }],
            };

            const { data } = await orderAPI.createQuick(payload, idemKey);
            const created = data.data;

            if (paymentType === "online" && storeConfig.razorpayEnabled && window.Razorpay) {
                try {
                    const { data: rzpRes } = await paymentAPI.createOrder({ orderId: created._id });
                    const rzp = new window.Razorpay({
                        key: rzpRes.data.keyId || storeConfig.razorpayKeyId,
                        amount: rzpRes.data.amount,
                        currency: "INR",
                        name: "Bangels Verse",
                        description: `Order ${created.orderCode}`,
                        order_id: rzpRes.data.id,
                        prefill: { name: customerName, contact: digits },
                        theme: { color: "#7C1D26" },
                        handler: async (resp) => {
                            await paymentAPI.verify({
                                razorpay_order_id: resp.razorpay_order_id,
                                razorpay_payment_id: resp.razorpay_payment_id,
                                razorpay_signature: resp.razorpay_signature,
                                orderId: created._id,
                            });
                            setConfirmedOrder({ ...created, isPaid: true, status: "paid" });
                            toast.success(isHindi ? "भुगतान और ऑर्डर पक्का हुआ!" : "Payment & order confirmed!");
                        },
                    });
                    rzp.open();
                    setSubmitting(false);
                    return;
                } catch {
                    toast("Online payment window skipped — order saved as pending. You can pay cash on delivery.", {
                        icon: "ℹ️",
                    });
                }
            }

            setConfirmedOrder(created);
            toast.success(isHindi ? "आपका ऑर्डर पक्का हो गया!" : "Order confirmed!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not place order");
        }
        setSubmitting(false);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/60 backdrop-blur-xs p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-order-title"
        >
            <div className="bg-ivory w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto border border-parchment shadow-elevated animate-fade-in">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-ivory/95 backdrop-blur-sm border-b border-parchment px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 id="quick-order-title" className="text-2xl font-serif font-bold text-ink">
                            {confirmedOrder ? t("orderSuccessTitle") : t("quickOrderTitle")}
                        </h2>
                        {!confirmedOrder && (
                            <p className="text-xs text-umber">{t("quickOrderSub")}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={closeQuickOrder}
                        aria-label="Close quick order"
                        className="w-10 h-10 rounded-full bg-linen hover:bg-parchment flex items-center justify-center text-ink transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {confirmedOrder ? (
                    <div className="p-6 text-center space-y-5">
                        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={36} />
                        </div>

                        <div className="bg-white border-2 border-dashed border-brass-400 rounded-xl p-5">
                            <p className="text-xs uppercase tracking-wider text-umber font-semibold">
                                {t("orderCodeLabel")}
                            </p>
                            <p className="text-3xl font-mono font-bold text-sindoor-700 mt-1 tracking-wider">
                                {confirmedOrder.orderCode}
                            </p>
                            <p className="text-xs text-umber mt-2">{t("saveCodeHint")}</p>
                        </div>

                        <div className="bg-white border border-parchment rounded-xl p-4 text-left space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-umber">{product.name}</span>
                                <span className="font-semibold text-ink">
                                    {size} × {quantity}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-umber">{isHindi ? "कुल राशि" : "Total Payable"}</span>
                                <PriceTag amount={confirmedOrder.totalAmount} className="text-base" />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-umber">{isHindi ? "भुगतान" : "Payment"}</span>
                                <span className="font-medium text-ink capitalize">
                                    {confirmedOrder.paymentType === "cash"
                                        ? isHindi ? "घर पहुँचने पर नकद" : "Cash on Delivery"
                                        : confirmedOrder.paymentType}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp text-sm">
                                <MessageCircle size={17} />
                                {isHindi ? "WhatsApp पर भेजें" : "Save on WhatsApp"}
                            </a>
                            <button type="button" onClick={closeQuickOrder} className="btn-primary text-sm">
                                {isHindi ? "ठीक है" : "Done Shopping"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-5">
                        {/* Selected Bangle Strip */}
                        <div className="flex items-center gap-3.5 bg-white border border-parchment rounded-xl p-3">
                            <img
                                src={resolveAssetUrl(product.image) || "/images/products/gold-kada.svg"}
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover bg-linen shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="font-serif font-bold text-lg text-ink leading-tight truncate">
                                    {isHindi && product.nameHi ? product.nameHi : product.name}
                                </p>
                                <p className="text-xs text-umber mt-0.5">
                                    {product.setCount ? `Set of ${product.setCount}` : product.category}
                                </p>
                                <PriceTag amount={product.price} compareAtPrice={product.compareAtPrice} className="mt-1 text-sm" />
                            </div>
                        </div>

                        {/* Size + Quantity */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold uppercase tracking-wide text-umber">
                                        {t("selectSize")}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={openSizeGuide}
                                        className="text-xs font-semibold text-sindoor-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <Ruler size={13} /> {t("sizeGuideLink")}
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSize(s)}
                                            className={`px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors min-h-[42px] ${
                                                size === s
                                                    ? "bg-sindoor-600 text-white border-sindoor-600"
                                                    : "bg-white text-ink border-parchment hover:border-sindoor-400"
                                            }`}
                                        >
                                            <span>{s}</span>
                                            {SIZE_INFO[s] && (
                                                <span className={`block text-[10px] font-normal ${size === s ? "text-white/80" : "text-umber"}`}>
                                                    {SIZE_INFO[s]}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-umber mb-2">
                                    {t("quantity")}
                                </label>
                                <div className="flex items-center bg-white border border-parchment rounded-lg w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                        className="w-11 h-11 flex items-center justify-center text-ink hover:bg-linen transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg tabular-nums">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                                        aria-label="Increase quantity"
                                        className="w-11 h-11 flex items-center justify-center text-ink hover:bg-linen transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3 Simple Customer Fields */}
                        <div className="space-y-3 bg-white border border-parchment rounded-xl p-4">
                            <div>
                                <label htmlFor="qo-name" className="block text-sm font-semibold text-ink mb-1">
                                    {t("yourName")} *
                                </label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/70" />
                                    <input
                                        id="qo-name"
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder={isHindi ? "उदाहरण: सुनीता देवी" : "e.g. Sunita Devi"}
                                        className="input-field !pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="qo-phone" className="block text-sm font-semibold text-ink mb-1">
                                    {t("mobileNumber")} *
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-umber/70" />
                                    <input
                                        id="qo-phone"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={13}
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        placeholder="9876543210"
                                        className="input-field !pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label htmlFor="qo-addr" className="block text-sm font-semibold text-ink mb-1">
                                        {t("deliveryAddress")} *
                                    </label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3.5 top-3.5 text-umber/70" />
                                        <input
                                            id="qo-addr"
                                            type="text"
                                            value={line1}
                                            onChange={(e) => setLine1(e.target.value)}
                                            placeholder={isHindi ? "मकान नं., मोहल्ला, गाँव" : "House no, mohalla, landmark"}
                                            className="input-field !pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="qo-city" className="block text-sm font-semibold text-ink mb-1">
                                        {t("cityLabel")}
                                    </label>
                                    <input
                                        id="qo-city"
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder={isHindi ? "शहर / कस्बा" : "City / Town"}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Choice */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-umber mb-2">
                                {t("paymentMethod")}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setPaymentType("cash")}
                                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                                        paymentType === "cash"
                                            ? "border-sindoor-600 bg-sindoor-50/70"
                                            : "border-parchment bg-white hover:border-sindoor-300"
                                    }`}
                                >
                                    <Banknote size={20} className="text-sindoor-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-ink">{t("codTitle")}</p>
                                        <p className="text-xs text-umber mt-0.5">{t("codDesc")}</p>
                                    </div>
                                </button>

                                {storeConfig.razorpayEnabled && (
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType("online")}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                                            paymentType === "online"
                                                ? "border-sindoor-600 bg-sindoor-50/70"
                                                : "border-parchment bg-white hover:border-sindoor-300"
                                        }`}
                                    >
                                        <CreditCard size={20} className="text-sindoor-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-ink">{t("onlineTitle")}</p>
                                            <p className="text-xs text-umber mt-0.5">{t("onlineDesc")}</p>
                                        </div>
                                    </button>
                                )}

                                {user && (
                                    <button
                                        type="button"
                                        onClick={() => setPaymentType("credit")}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors sm:col-span-2 ${
                                            paymentType === "credit"
                                                ? "border-sindoor-600 bg-sindoor-50/70"
                                                : "border-parchment bg-white hover:border-sindoor-300"
                                        }`}
                                    >
                                        <BookOpen size={20} className="text-brass-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-ink">{t("khataTitle")}</p>
                                            <p className="text-xs text-umber mt-0.5">{t("khataDesc")}</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Confirm CTA + WhatsApp Fallback */}
                        <div className="space-y-3 pt-1">
                            <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-3.5">
                                <ShoppingBag size={18} />
                                {submitting
                                    ? t("placingOrder")
                                    : `${t("confirmOrder")} — ₹${total.toLocaleString("en-IN")}`}
                            </button>

                            <div className="flex items-center justify-between gap-2 pt-1">
                                <a
                                    href={whatsappHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 btn-whatsapp text-sm py-2.5"
                                >
                                    <MessageCircle size={17} />
                                    {t("whatsappOrder")}
                                </a>
                                <a
                                    href={`tel:${storeConfig.supportPhone}`}
                                    className="btn-secondary text-sm py-2.5 px-4"
                                >
                                    <Phone size={16} />
                                    {isHindi ? "कॉल करें" : "Call"}
                                </a>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

