import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "CUSTOMER" | "MECHANIC" | "ADMIN";
    email: string;
    customerId?: string;
    mechanicId?: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required. Missing token." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
}

export function authorizeRoles(...allowedRoles: Array<"CUSTOMER" | "MECHANIC" | "ADMIN">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
    }
    next();
  };
}
