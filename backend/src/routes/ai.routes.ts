import { Router } from "express";
import { AIController } from "../controllers/ai.controller.js";

const router = Router();

router.post("/diagnose", AIController.diagnose);

export default router;
