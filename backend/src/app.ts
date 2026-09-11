import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import mechanicRoutes from "./routes/mechanic.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "MechConnect Backend API",
    time: new Date().toISOString(),
    demoMode: true
  });
});

app.use(errorHandler);

export default app;
