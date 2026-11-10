import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "./user.model.js";
import { AppError, normalizePhone } from "../../utils/errors.js";

const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "14d",
    });

const sanitizeUser = (userDoc) => {
    const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete obj.password;
    return {
        ...obj,
        id: obj._id,
    };
};

export const registerUser = async (data) => {
    const {
        name,
        email,
        phone,
        password,
        role,
        companyName,
        address,
        city,
        pincode,
        preferredLanguage,
    } = data;

    if (role === "admin") {
        throw new AppError("Cannot register as admin", 403, "FORBIDDEN");
    }

    const cleanEmail = email?.trim().toLowerCase() || undefined;
    const cleanPhone = phone ? normalizePhone(phone) : undefined;

    if (!cleanEmail && !cleanPhone) {
        throw new AppError("Please provide a phone number or email", 400, "MISSING_CONTACT");
    }
    if (cleanPhone && cleanPhone.length !== 10) {
        throw new AppError("Please enter a valid 10-digit mobile number", 400, "INVALID_PHONE");
    }

    if (cleanEmail) {
        const existingEmail = await User.findOne({ email: cleanEmail });
        if (existingEmail) {
            throw new AppError("An account with this email already exists", 409, "DUPLICATE_EMAIL");
        }
    }

    let quickAccountToUpgrade = null;
    if (cleanPhone) {
        const existingPhone = await User.findOne({ phone: cleanPhone }).select("+password");
        if (existingPhone) {
            // Upgrade quick guest customer account if they never set a password
            if (existingPhone.isQuickAccount && !existingPhone.password && role !== "owner") {
                quickAccountToUpgrade = existingPhone;
            } else {
                throw new AppError("An account with this mobile number already exists", 409, "DUPLICATE_PHONE");
            }
        }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    if (quickAccountToUpgrade) {
        quickAccountToUpgrade.name = name.trim();
        if (cleanEmail) quickAccountToUpgrade.email = cleanEmail;
        quickAccountToUpgrade.password = hashedPassword;
        quickAccountToUpgrade.address = address ?? quickAccountToUpgrade.address;
        quickAccountToUpgrade.city = city ?? quickAccountToUpgrade.city;
        quickAccountToUpgrade.pincode = pincode ?? quickAccountToUpgrade.pincode;
        quickAccountToUpgrade.isQuickAccount = false;
        user = await quickAccountToUpgrade.save();
    } else {
        user = await User.create({
            name: name.trim(),
            ...(cleanEmail ? { email: cleanEmail } : {}),
            ...(cleanPhone ? { phone: cleanPhone, whatsappNumber: cleanPhone } : {}),
            password: hashedPassword,
            role: role === "owner" ? "owner" : "user",
            companyName: companyName?.trim() || "",
            address: address?.trim() || "",
            city: city?.trim() || "",
            pincode: pincode?.trim() || "",
            preferredLanguage: preferredLanguage === "hi" ? "hi" : "en",
            isApproved: false,
            isQuickAccount: false,
        });
    }

    const token = signToken(user);
    return {
        user: sanitizeUser(user),
        token,
    };
};

export const loginUser = async (data) => {
    const rawIdentifier = (data.identifier || data.email || data.phone || "").trim();
    const { password } = data;

    if (!rawIdentifier || !password) {
        throw new AppError("Please enter mobile/email and password", 400, "MISSING_CREDENTIALS");
    }

    const digits = normalizePhone(rawIdentifier);
    const isPhone = !rawIdentifier.includes("@") && digits.length === 10;

    const query = isPhone ? { phone: digits } : { email: rawIdentifier.toLowerCase() };
    const user = await User.findOne(query).select("+password");

    if (!user || !user.password) {
        throw new AppError("Invalid mobile/email or password", 401, "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid mobile/email or password", 401, "INVALID_CREDENTIALS");
    }

    const token = signToken(user);
    return {
        user: sanitizeUser(user),
        token,
    };
};

export const getProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return sanitizeUser(user);
};

export const updateProfile = async (userId, data) => {
    const allowedFields = [
        "name",
        "phone",
        "whatsappNumber",
        "bio",
        "companyName",
        "address",
        "city",
        "pincode",
        "profilePicture",
        "preferredLanguage",
    ];
    const updateData = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            if (field === "phone" || field === "whatsappNumber") {
                const normalized = normalizePhone(data[field]);
                if (data[field] && normalized.length !== 10) {
                    throw new AppError("Mobile number must be 10 digits", 400, "INVALID_PHONE");
                }
                if (normalized) updateData[field] = normalized;
            } else {
                updateData[field] = typeof data[field] === "string" ? data[field].trim() : data[field];
            }
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return sanitizeUser(user);
};
