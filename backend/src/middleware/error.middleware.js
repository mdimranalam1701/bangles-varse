import { AppError } from "../utils/errors.js";

export const validate = (schema, source = "body") => (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstIssue = parsed.error.issues[0];
        const msg = firstIssue
            ? `${firstIssue.path.join(".") || "input"}: ${firstIssue.message}`
            : "Validation failed";
        return res.status(422).json({
            success: false,
            message: msg,
            error: {
                code: "VALIDATION_ERROR",
                message: msg,
                details: flattened,
            },
        });
    }
    req[source] = parsed.data;
    next();
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: {
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.originalUrl} not found`,
        },
    });
};

export const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let code = err.code || "INTERNAL_ERROR";
    let message = err.message || "Something went wrong";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
    } else if (err.name === "ValidationError") {
        statusCode = 422;
        code = "VALIDATION_ERROR";
        message = Object.values(err.errors || {})
            .map((e) => e.message)
            .join(", ") || "Validation failed";
    } else if (err.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = "Invalid resource identifier";
    } else if (err.code === 11000) {
        statusCode = 409;
        code = "DUPLICATE_ENTRY";
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        message = `An account or record with this ${field} already exists`;
    } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        statusCode = 401;
        code = "UNAUTHORIZED";
        message = "Session expired. Please sign in again.";
    } else if (err.name === "MulterError") {
        statusCode = 400;
        code = "UPLOAD_ERROR";
        message = err.message;
    }

    if (statusCode >= 500) {
        console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
        if (process.env.NODE_ENV === "production") {
            message = "Internal server error. Please try again.";
        }
    }

    res.status(statusCode).json({
        success: false,
        message,
        error: {
            code,
            message,
            ...(err.details ? { details: err.details } : {}),
        },
    });
};

