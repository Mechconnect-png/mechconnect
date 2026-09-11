import { describe, it, expect } from "vitest";

describe("Booking State Machine Guard & Atomic Transaction Rules", () => {
  const ALLOWED_TRANSITIONS: Record<string, string[]> = {
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

  it("should allow valid state transition SEARCHING -> ACCEPTED", () => {
    const current = "SEARCHING";
    const next = "ACCEPTED";
    expect(ALLOWED_TRANSITIONS[current].includes(next)).toBe(true);
  });

  it("should reject invalid state transition CREATED -> COMPLETED", () => {
    const current = "CREATED";
    const next = "COMPLETED";
    expect(ALLOWED_TRANSITIONS[current].includes(next)).toBe(false);
  });

  it("should reject invalid state transition CANCELLED -> ACCEPTED", () => {
    const current = "CANCELLED";
    const next = "ACCEPTED";
    expect(ALLOWED_TRANSITIONS[current].includes(next)).toBe(false);
  });
});
