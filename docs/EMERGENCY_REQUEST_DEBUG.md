# MechConnect — Emergency SOS Roadside Assistance Diagnosis & Repair Report

## 🔍 Overview
The **Urgent Assistance** flow has been upgraded into a full **1-Click Emergency SOS System**.

---

## 🛠️ Emergency SOS Architecture & Data Flow

### 1. Customer Emergency SOS Trigger (`CustomerHomePage.tsx`)
- Toggling **🚨 EMERGENCY SOS** enables high-visibility Emergency SOS mode with top pulsating strobe alert ("EMERGENCY SOS MODE ACTIVE").
- Clicking **🚨 DISPATCH EMERGENCY SOS NOW** opens the **Emergency SOS Dispatch Sheet** with safety instructions ("Turn on hazard blinkers", "Move to safe area", "Stay inside locked doors") and an immediate 1-click dispatch trigger.
- Creates `ServiceRequest` in SQLite with `priority: "URGENT"` and issue description `"🚨 EMERGENCY SOS - Immediate Roadside Assistance Required"`.

### 2. Emergency SOS Radar Search (`MatchingModal.tsx`)
- Displays red strobe radar animation: **🚨 EMERGENCY SOS BROADCAST**.
- Transmits urgent roadside payload to all nearby online Chennai technicians.

### 3. Mechanic Real-time SOS Alert Overlay (`IncomingRequestModal.tsx`)
- Mechanic screen triggers high-contrast red emergency overlay with **🚨 URGENT EMERGENCY REQUEST** blinking badge.
- Displays Customer Name, Vehicle (*Honda City TN 07 CX 4589*), Breakdown Location, Issue Description, and Estimated Earnings.
- 15-Second emergency countdown timer.
- **Accept Emergency Job** button executes atomic database transaction (`prisma.$transaction`).

### 4. Real-time Customer State Update
- Customer screen automatically updates to `ACCEPTED` and `EN_ROUTE` without page refresh.
- Leaflet map animates mechanic marker towards customer GPS breakdown pin.

---

## 🧪 Verification Matrix

| Step | Test Description | Result |
|---|---|---|
| 1 | Customer toggles **🚨 EMERGENCY SOS** | **PASS** |
| 2 | Customer clicks **DISPATCH EMERGENCY SOS NOW** | **PASS** |
| 3 | `priority: "URGENT"` stored in SQLite database | **PASS** |
| 4 | Socket.IO broadcasts `request:new` to online mechanics | **PASS** |
| 5 | Mechanic receives 🚨 **URGENT EMERGENCY** alert modal | **PASS** |
| 6 | Customer, vehicle, address, and ₹ amount render cleanly | **PASS** |
| 7 | 15-Second emergency countdown bar operates | **PASS** |
| 8 | Mechanic clicks **Accept Emergency Job** | **PASS** |
| 9 | Real-time state updates to `ACCEPTED` on customer screen | **PASS** |
| 10 | Production build (`tsc && vite build`) | **SUCCESS** |
