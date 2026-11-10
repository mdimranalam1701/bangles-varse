import { Coupon } from "./coupon.model.js";

export const createCoupon = async (data) => {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error("Coupon code already exists");
    return await Coupon.create({ ...data, code: data.code.toUpperCase() });
};

export const getAllCoupons = async () => {
    return await Coupon.find().sort({ createdAt: -1 });
};

export const getCouponByCode = async (code) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw new Error("Invalid coupon code");
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error("Coupon has expired");
    }
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("Coupon usage limit reached");
    }
    return coupon;
};

export const validateCoupon = async (code, userId, orderAmount) => {
    const coupon = await getCouponByCode(code);

    if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
        throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
    }

    if (coupon.usedBy.includes(userId)) {
        throw new Error("You have already used this coupon");
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount > 0) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else {
        discount = coupon.discountValue;
    }

    return { coupon, discount: Math.round(discount) };
};

export const applyCoupon = async (code, userId) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) throw new Error("Coupon not found");

    coupon.usedCount += 1;
    coupon.usedBy.push(userId);
    await coupon.save();
    return coupon;
};

export const updateCoupon = async (id, data) => {
    return await Coupon.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCoupon = async (id) => {
    return await Coupon.findByIdAndDelete(id);
};

export const toggleCoupon = async (id) => {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new Error("Coupon not found");
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
};
