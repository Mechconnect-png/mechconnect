# MechConnect — REST API & Socket.IO Specifications

## 🔑 Authentication Endpoints

- `POST /api/auth/register` — Register new Customer or Mechanic.
- `POST /api/auth/login` — Sign in and obtain JWT token.
- `GET /api/auth/me` — Fetch currently authenticated user profile.

## 👤 Customer Endpoints

- `GET /api/customer/service-types` — Fetch roadside assistance service types & prices.
- `GET /api/customer/vehicles` — Fetch registered vehicles.
- `POST /api/customer/vehicles` — Add new vehicle to garage.
- `DELETE /api/customer/vehicles/:id` — Delete vehicle.
- `GET /api/customer/active-booking` — Fetch active breakdown request.
- `GET /api/customer/history` — Fetch past completed booking receipts.

## 📌 Booking & Service Endpoints

- `POST /api/bookings` — Create roadside assistance request.
- `POST /api/bookings/:id/accept` — Mechanic accepts request (Atomic transaction).
- `PUT /api/bookings/:id/status` — Update booking state (`EN_ROUTE`, `ARRIVED`, `SERVICING`, `COMPLETED`).
- `POST /api/bookings/:id/extra-charge` — Mechanic requests additional part/labor charge.
- `POST /api/bookings/extra-charge/:chargeId/respond` — Customer approves/declines extra charge.
- `POST /api/bookings/:id/payment` — Process zero-cost simulated payment.
- `POST /api/bookings/:id/rating` — Submit 5-star mechanic review.

## 🤖 AI Diagnosis Endpoint

- `POST /api/ai/diagnose` — Rule-based AI symptom analysis.

## 🛡️ Admin Endpoints

- `GET /api/admin/dashboard` — System statistics & metrics.
- `GET /api/admin/mechanics` — Fetch mechanic list.
- `PUT /api/admin/mechanics/:id/verify` — Approve or revoke mechanic verification.
