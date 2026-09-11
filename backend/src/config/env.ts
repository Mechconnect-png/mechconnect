import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  JWT_SECRET: process.env.JWT_SECRET || "mechconnect_super_secret_jwt_key_2026_zero_cost",
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Zero-Cost Demo Flags
  DEMO_AI_MODE: process.env.DEMO_AI_MODE === "true" || true,
  DEMO_PAYMENT_MODE: process.env.DEMO_PAYMENT_MODE === "true" || true,
  DEMO_TRACKING_MODE: process.env.DEMO_TRACKING_MODE === "true" || true,
  DEMO_ROUTING_MODE: process.env.DEMO_ROUTING_MODE === "true" || true,
  DEMO_DATA_MODE: process.env.DEMO_DATA_MODE === "true" || true,
};
