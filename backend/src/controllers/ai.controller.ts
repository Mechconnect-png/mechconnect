import { Request, Response } from "express";
import { AIService } from "../services/ai.service.js";

export class AIController {
  public static async diagnose(req: Request, res: Response) {
    try {
      const { vehicleType, symptomsText, startsEngine, clickingSound, flatTyre, smokeOrHeat, warningLights, stoppedSuddenly } = req.body;

      const diagnosis = AIService.diagnose({
        vehicleType,
        symptomsText,
        startsEngine,
        clickingSound,
        flatTyre,
        smokeOrHeat,
        warningLights,
        stoppedSuddenly
      });

      return res.json({
        success: true,
        diagnosis
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
