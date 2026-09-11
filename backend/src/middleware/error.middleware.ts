import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Global API Error:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error occurred.";

  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}
