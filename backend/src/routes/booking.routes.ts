import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

router.post("/", BookingController.createBooking);
router.post("/:id/cancel", BookingController.cancelBooking);
router.post("/:id/accept", BookingController.acceptBooking);
router.put("/:id/status", BookingController.updateStatus);
router.post("/:id/extra-charge", BookingController.addExtraCharge);
router.post("/extra-charge/:chargeId/respond", BookingController.respondExtraCharge);
router.post("/:id/payment", BookingController.processPayment);
router.post("/:id/rating", BookingController.submitRating);

export default router;
