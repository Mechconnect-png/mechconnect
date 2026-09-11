import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/service-types", CustomerController.getServiceTypes);

router.use(authenticateJWT, authorizeRoles("CUSTOMER", "ADMIN"));
router.get("/vehicles", CustomerController.getVehicles);
router.post("/vehicles", CustomerController.addVehicle);
router.delete("/vehicles/:id", CustomerController.deleteVehicle);
router.get("/active-booking", CustomerController.getActiveBooking);
router.get("/history", CustomerController.getHistory);

export default router;
