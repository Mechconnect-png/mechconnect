# MechConnect — System Architecture & Design

## 🏛️ System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 REACT FRONTEND                                    |
|   +-------------------+   +--------------------+   +--------------------------+   |
|   | Map-First Customer|   | Mechanic Dashboard |   | Admin Command Center     |   |
|   | (Leaflet Map)     |   | (15s Request Modal)|   | (Verification & Recharts)|   |
|   +-------------------+   +--------------------+   +--------------------------+   |
+----------------------------------------+------------------------------------------+
                                         | HTTP REST API & WebSockets (Socket.IO)
                                         v
+-----------------------------------------------------------------------------------+
|                                 EXPRESS BACKEND                                   |
|   +-------------------+   +--------------------+   +--------------------------+   |
|   | Auth & JWT        |   | Matching Service   |   | AI Diagnosis Engine      |   |
|   | Middleware        |   | (Weighted Score)   |   | (Rule-Based Engine)      |   |
|   +-------------------+   +--------------------+   +--------------------------+   |
+----------------------------------------+------------------------------------------+
                                         | Prisma ORM
                                         v
+-----------------------------------------------------------------------------------+
|                              EMBEDDED SQLITE DATABASE                             |
|  [User] -- [Customer/Mechanic] -- [Vehicle] -- [ServiceRequest] -- [Payment]      |
+-----------------------------------------------------------------------------------+
```

## 🧠 AI Diagnosis Engine Architecture (`AIService`)

The AI engine uses structured symptom classification matching symptom vectors against diagnostic decision trees:

1. **Input Parameters**: `startsEngine`, `clickingSound`, `flatTyre`, `smokeOrHeat`, `symptomsText`.
2. **Rule Matrix**:
   - `startsEngine == false` && `clickingSound == true` → Battery Failure (89% Confidence).
   - `flatTyre == true` || text contains `"puncture"` → Tyre Repair (94% Confidence).
   - `smokeOrHeat == true` || text contains `"steam"` → Engine Overheating (91% Confidence).
3. **Standardized Interface**: Designed with the strategy pattern (`AIDiagnosisResult`) to allow plugging external Gemini/OpenAI models in production without changing frontend code.

## 🔒 Atomic Double Booking Protection

To prevent multiple mechanics from accepting the same breakdown request concurrently:
- Uses Prisma's interactive transaction lock (`prisma.$transaction`).
- Checks if `ServiceRequest.status === 'SEARCHING'` and `mechanicId === null` in an isolated database transaction.
- If already assigned, throws an `ALREADY_ASSIGNED` exception returning HTTP 409 Conflict.
