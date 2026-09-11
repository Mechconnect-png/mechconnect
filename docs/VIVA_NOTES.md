# MechConnect — College Viva Presentation Notes & Q&A

This document contains key technical answers for your college final-year project viva examination.

---

## ❓ Frequently Asked Viva Questions

### 1. Why did you choose React + Node.js + Express?
> "We selected React for its component-based virtual DOM architecture, enabling a smooth map-first single-page application experience. Node.js and Express provide an event-driven, non-blocking I/O runtime ideally suited for handling real-time Socket.IO location updates and concurrent breakdown requests."

### 2. Why SQLite + Prisma instead of PostgreSQL/MongoDB?
> "SQLite is an embedded relational database that operates without requiring an external database server, satisfying our zero-cost college project constraint while maintaining strict relational schema integrity through Prisma ORM."

### 3. How does the AI Diagnosis Engine work without paid APIs?
> "We implemented an intelligent rule-based expert engine (`AIService`). It processes symptom flags (clicking sounds, engine starting, smoke, flat tyre) against rule matrices to determine likely breakdown causes, confidence percentages, estimated costs, and safety steps. The service uses a standardized API signature so a production LLM like Gemini or OpenAI can be plugged in later."

### 4. How does the Mechanic Matching Algorithm work?
> "The matching engine calculates a composite match score (0-100%) using 4 weighted parameters:
> - **Distance Score (40%)**: Uses the Haversine formula to compute distance from customer GPS coordinates.
> - **Skill Compatibility Score (30%)**: Matches mechanic skills against the required service category.
> - **Mechanic Rating (15%)**: Evaluates historical 5-star customer ratings.
> - **Availability & Workload (15%)**: Considers active ongoing jobs."

### 5. How is double-booking prevented when multiple mechanics try to accept a job simultaneously?
> "We use Prisma's atomic interactive database transactions (`prisma.$transaction`). When a mechanic accepts a request, the database atomically updates `ServiceRequest.status` from `SEARCHING` to `ACCEPTED` with `mechanicId` set ONLY IF `mechanicId` is currently `null`. If a second mechanic attempts to accept, the condition fails and returns an `ALREADY_ASSIGNED` HTTP 409 conflict error."

### 6. How does real-time live tracking work?
> "We use Socket.IO WebSockets. Mechanics stream their browser GPS coordinates via the `mechanic:location_update` event. The server broadcasts the updated position to the specific booking room (`booking_${id}`), and the customer's Leaflet map smoothly animates the mechanic marker along the polyline route."

### 7. How does the project handle payments without paid gateways?
> "We created an interactive simulated payment gateway (`DEMO_PAYMENT_MODE`). It simulates UPI QR scanning, card verification, and wallet transactions, returning real payment status transitions (`PAID`) and transaction IDs without storing or processing real card details."
