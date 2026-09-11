# MechConnect — Testing & Verification Guide

## 🧪 Automated Testing

MechConnect includes automated unit and integration tests written with Vitest.

### Run Backend Tests

```bash
cd backend
npm test
```

### Test Coverage

1. **AI Diagnosis Engine Tests (`ai.service.test.ts`)**:
   - Verifies battery failure diagnosis for clicking sound & starter failure.
   - Verifies tyre puncture detection.
   - Verifies fuel delivery recommendations.
   - Verifies overheating & critical severity alerts.

2. **Matching Engine Tests (`matching.service.test.ts`)**:
   - Verifies match score calculations for online verified mechanics.
   - Verifies filtering of offline or unverified mechanics.

---

## 🛠️ Production Build Verification

To verify that all TypeScript types, React components, and Node/Express code compile with 0 errors:

```bash
# In root folder
npm run build
```

Both `backend` (TypeScript compiler `tsc`) and `frontend` (`tsc && vite build`) will compile cleanly.
