# MechConnect — AI-Powered On-Demand Roadside Assistance Platform

> **College Final Year Project — Complete Zero-Cost Architecture**

MechConnect connects vehicle owners with nearby certified mechanics when a vehicle breaks down on the road. Built with modern full-stack technologies requiring zero paid service subscriptions.

---

## 🚀 Key Features

1. **Map-First Customer Experience**:
   - Full OpenStreetMap + Leaflet interactive map with custom customer pulse pin, nearby available mechanic markers, and live polyline routing.
   - Dynamic location search, GPS positioning, and Demo Location Mode.
   - Draggable bottom sheet with vehicle selector, roadside service cards, and primary booking CTA.

2. **AI Vehicle Assistant**:
   - Built-in intelligent rule-based breakdown engine (`AIService`) requiring 0 paid AI APIs.
   - Interactive diagnostic questionnaire (engine start, clicking sound, smoke, flat tyre).
   - Generates likely issue, confidence percentage, recommended service, severity level, and immediate safety action steps.

3. **Intelligent Mechanic Matching**:
   - Weighted scoring algorithm evaluating Distance (40%), Skill Compatibility (30%), Mechanic Rating (15%), and Availability & Workload (15%).
   - Displays real-time matching radar animation and Best Match recommendation card.

4. **Realtime Socket.IO Communication**:
   - Live location streaming & route ETA updates.
   - 15-second incoming job dispatch alert modal for online mechanics.
   - **Atomic Transaction Double Booking Protection**: Uses database transactions to ensure two mechanics cannot accept the same customer request.
   - Live in-app chat between customer and assigned mechanic.

5. **Complete Service Workflow & Payments**:
   - Live status timeline: `ACCEPTED` → `EN_ROUTE` → `ARRIVED` → `SERVICING` → `COMPLETED`.
   - Mechanic can request approval for additional part/labor charges.
   - Itemized digital invoice breakdown.
   - **Zero-Cost Simulated Payment Gateway** (UPI Demo, Card Demo, Cash, MechWallet Demo).
   - 5-Star rating and review submission.

6. **Mechanic & Admin Dashboards**:
   - Mechanic portal with Online/Offline toggle, job tracker, and earnings dashboard.
   - Admin command center with user management, mechanic verification governance, active map monitoring, and Recharts system revenue trends.

---

## 🔑 Demo Login Credentials (Viva Ready)

| Role | Email | Password |
|---|---|---|
| 👤 **Customer** | `customer@mechconnect.com` | `password123` |
| 🔧 **Mechanic** | `mechanic@mechconnect.com` | `password123` |
| 🛡️ **Admin** | `admin@mechconnect.com` | `password123` |

---

## 🛠️ Zero-Cost Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet / React-Leaflet, Lucide React, Framer Motion, Recharts
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Prisma ORM
- **Database**: SQLite (embedded, zero-cost, zero configuration)
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing
