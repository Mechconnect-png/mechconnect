"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_js_1 = require("../services/ai.service.js");
class AIController {
    static async diagnose(req, res) {
        try {
            const { vehicleType, symptomsText, startsEngine, clickingSound, flatTyre, smokeOrHeat, warningLights, stoppedSuddenly } = req.body;
            const diagnosis = ai_service_js_1.AIService.diagnose({
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
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AIController = AIController;
