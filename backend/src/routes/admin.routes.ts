import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT, authorizeRoles("ADMIN"));
router.get("/dashboard", AdminController.getDashboardStats);
router.get("/mechanics", AdminController.getMechanics);
router.put("/mechanics/:id/verify", AdminController.verifyMechanic);
router.get("/bookings", AdminController.getAllBookings);

export default router;
