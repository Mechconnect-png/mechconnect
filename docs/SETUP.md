# MechConnect — Setup & Installation Guide

This guide explains how to set up and run MechConnect locally on your computer with zero external paid dependencies.

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

---

## ⚡ Quick Start (1-Command Setup)

### 1. Install Dependencies & Build Database

```bash
# In project root:
cd backend
npm install
npx prisma db push
npm run seed

cd ../frontend
npm install
```

### 2. Launch Development Server

```bash
# Terminal 1 — Start Backend Server (Port 5000)
cd backend
npm run dev

# Terminal 2 — Start Frontend Application (Port 3000)
cd frontend
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## ⚙️ Environment Variables (`.env`)

The project pre-includes zero-cost configuration in `backend/.env`:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="mechconnect_super_secret_jwt_key_2026_zero_cost"
NODE_ENV=development

# Zero-Cost Demo Flags
DEMO_AI_MODE=true
DEMO_PAYMENT_MODE=true
DEMO_TRACKING_MODE=true
DEMO_ROUTING_MODE=true
DEMO_DATA_MODE=true
```
