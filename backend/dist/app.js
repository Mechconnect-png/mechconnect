"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const customer_routes_js_1 = __importDefault(require("./routes/customer.routes.js"));
const mechanic_routes_js_1 = __importDefault(require("./routes/mechanic.routes.js"));
const booking_routes_js_1 = __importDefault(require("./routes/booking.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const ai_routes_js_1 = __importDefault(require("./routes/ai.routes.js"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/customer", customer_routes_js_1.default);
app.use("/api/mechanic", mechanic_routes_js_1.default);
app.use("/api/bookings", booking_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
app.use("/api/ai", ai_routes_js_1.default);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        service: "MechConnect Backend API",
        time: new Date().toISOString(),
        demoMode: true
    });
});
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
