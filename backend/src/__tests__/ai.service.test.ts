import { describe, it, expect } from "vitest";
import { AIService } from "../services/ai.service.js";

describe("AIService — Local Rule-Based Diagnosis Engine", () => {
  it("should diagnose battery issue for clicking sound and engine start failure", () => {
    const result = AIService.diagnose({
      startsEngine: false,
      clickingSound: true,
      symptomsText: "Bike won't start and I hear clicking sound"
    });

    expect(result.recommendedServiceKey).toBe("BATTERY");
    expect(result.confidence).toBeGreaterThanOrEqual(85);
    expect(result.problem).toContain("Battery");
    expect(result.severity).toBe("Medium");
  });

  it("should diagnose tyre puncture for flat tire symptoms", () => {
    const result = AIService.diagnose({
      flatTyre: true,
      symptomsText: "Car tire lost air pressure suddenly"
    });

    expect(result.recommendedServiceKey).toBe("TYRE");
    expect(result.confidence).toBeGreaterThanOrEqual(90);
  });

  it("should diagnose fuel delivery issue when engine runs out of gas", () => {
    const result = AIService.diagnose({
      startsEngine: false,
      symptomsText: "Engine stopped and fuel tank is empty"
    });

    expect(result.recommendedServiceKey).toBe("FUEL");
  });

  it("should diagnose overheating for steam and smoke symptoms", () => {
    const result = AIService.diagnose({
      smokeOrHeat: true,
      symptomsText: "High temperature warning light and steam from engine hood"
    });

    expect(result.recommendedServiceKey).toBe("OVERHEATING");
    expect(result.severity).toBe("High");
  });
});
