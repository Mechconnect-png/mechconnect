import { Router } from "express";
import { MechanicController } from "../controllers/mechanic.controller.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT, authorizeRoles("MECHANIC", "ADMIN"));
router.get("/profile", MechanicController.getProfile);
router.put("/availability", MechanicController.toggleAvailability);
router.post("/location", MechanicController.updateLocation);
router.get("/requests", MechanicController.getAvailableRequests);
router.get("/earnings", MechanicController.getEarnings);

export default router;
