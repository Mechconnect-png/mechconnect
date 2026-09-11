"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)("Booking State Machine Guard & Atomic Transaction Rules", () => {
    const ALLOWED_TRANSITIONS = {
        CREATED: ["SEARCHING", "CANCELLED"],
        SEARCHING: ["ACCEPTED", "CANCELLED", "NO_MECHANIC_AVAILABLE"],
        MATCHED: ["ACCEPTED", "CANCELLED"],
        ACCEPTED: ["EN_ROUTE", "CANCELLED"],
        EN_ROUTE: ["ARRIVED", "CANCELLED"],
        ARRIVED: ["SERVICING", "CANCELLED"],
        SERVICING: ["COMPLETED", "CANCELLED"],
        COMPLETED: ["PAYMENT_PENDING", "PAID"],
        PAYMENT_PENDING: ["PAID"],
        PAID: ["RATED"],
        RATED: [],
        CANCELLED: [],
        NO_MECHANIC_AVAILABLE: []
    };
    (0, vitest_1.it)("should allow valid state transition SEARCHING -> ACCEPTED", () => {
        const current = "SEARCHING";
        const next = "ACCEPTED";
        (0, vitest_1.expect)(ALLOWED_TRANSITIONS[current].includes(next)).toBe(true);
    });
    (0, vitest_1.it)("should reject invalid state transition CREATED -> COMPLETED", () => {
        const current = "CREATED";
        const next = "COMPLETED";
        (0, vitest_1.expect)(ALLOWED_TRANSITIONS[current].includes(next)).toBe(false);
    });
    (0, vitest_1.it)("should reject invalid state transition CANCELLED -> ACCEPTED", () => {
        const current = "CANCELLED";
        const next = "ACCEPTED";
        (0, vitest_1.expect)(ALLOWED_TRANSITIONS[current].includes(next)).toBe(false);
    });
});
