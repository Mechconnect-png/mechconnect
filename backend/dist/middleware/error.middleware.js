"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error("Global API Error:", err);
    const status = err.statusCode || 500;
    const message = err.message || "Internal server error occurred.";
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
}
