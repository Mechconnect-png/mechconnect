"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ai_service_js_1 = require("../services/ai.service.js");
(0, vitest_1.describe)("AIService — Local Rule-Based Diagnosis Engine", () => {
    (0, vitest_1.it)("should diagnose battery issue for clicking sound and engine start failure", () => {
        const result = ai_service_js_1.AIService.diagnose({
            startsEngine: false,
            clickingSound: true,
            symptomsText: "Bike won't start and I hear clicking sound"
        });
        (0, vitest_1.expect)(result.recommendedServiceKey).toBe("BATTERY");
        (0, vitest_1.expect)(result.confidence).toBeGreaterThanOrEqual(85);
        (0, vitest_1.expect)(result.problem).toContain("Battery");
        (0, vitest_1.expect)(result.severity).toBe("Medium");
    });
    (0, vitest_1.it)("should diagnose tyre puncture for flat tire symptoms", () => {
        const result = ai_service_js_1.AIService.diagnose({
            flatTyre: true,
            symptomsText: "Car tire lost air pressure suddenly"
        });
        (0, vitest_1.expect)(result.recommendedServiceKey).toBe("TYRE");
        (0, vitest_1.expect)(result.confidence).toBeGreaterThanOrEqual(90);
    });
    (0, vitest_1.it)("should diagnose fuel delivery issue when engine runs out of gas", () => {
        const result = ai_service_js_1.AIService.diagnose({
            startsEngine: false,
            symptomsText: "Engine stopped and fuel tank is empty"
        });
        (0, vitest_1.expect)(result.recommendedServiceKey).toBe("FUEL");
    });
    (0, vitest_1.it)("should diagnose overheating for steam and smoke symptoms", () => {
        const result = ai_service_js_1.AIService.diagnose({
            smokeOrHeat: true,
            symptomsText: "High temperature warning light and steam from engine hood"
        });
        (0, vitest_1.expect)(result.recommendedServiceKey).toBe("OVERHEATING");
        (0, vitest_1.expect)(result.severity).toBe("High");
    });
});
