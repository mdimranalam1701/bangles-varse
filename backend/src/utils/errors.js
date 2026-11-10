export class AppError extends Error {
    constructor(message, statusCode = 400, code = "BAD_REQUEST", details = undefined) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
    }
}

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export const normalizePhone = (phone = "") => {
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }
    return digits;
};

