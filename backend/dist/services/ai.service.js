"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
class AIService {
    static diagnose(input) {
        const text = (input.symptomsText || "").toLowerCase();
        const { startsEngine, clickingSound, flatTyre, smokeOrHeat, stoppedSuddenly } = input;
        // Rule 1: Battery / Electrical failure
        if (clickingSound ||
            text.includes("click") ||
            text.includes("clicking") ||
            (startsEngine === false && (text.includes("battery") || text.includes("light dim") || text.includes("no sound"))) ||
            (startsEngine === false && text.includes("won't start"))) {
            return {
                problem: "Battery Failure / Weak Charge",
                confidence: 89,
                recommendedServiceKey: "BATTERY",
                recommendedServiceName: "Battery Assistance & Jumpstart",
                estimatedCostRange: "₹300 - ₹700",
                severity: "Medium",
                actionSteps: [
                    "Do not continuously turn ignition key to avoid starter motor strain",
                    "Ensure vehicle lights and AC unit are powered off",
                    "Mechanic will provide jumpstart or battery voltage testing on site"
                ],
                explanation: "Rapid clicking during ignition or failure to turn the engine indicates insufficient battery voltage to engage the starter solenoid."
            };
        }
        // Rule 2: Tyre puncture / Air leak
        if (flatTyre ||
            text.includes("flat") ||
            text.includes("puncture") ||
            text.includes("air pressure") ||
            text.includes("tyre") ||
            text.includes("tire")) {
            return {
                problem: "Tyre Puncture / Pressure Loss",
                confidence: 94,
                recommendedServiceKey: "TYRE",
                recommendedServiceName: "Flat Tyre Repair & Replacement",
                estimatedCostRange: "₹250 - ₹500",
                severity: "Low",
                actionSteps: [
                    "Park vehicle safely on the shoulder of the road",
                    "Engage handbrake / hazard warning lights",
                    "Mechanic will bring puncture kit or assist with spare tyre replacement"
                ],
                explanation: "Loss of air pressure or visible sag in tire wall requires immediate tube patch or tubeless plug insertion before driving further."
            };
        }
        // Rule 3: Fuel Exhaustion / Fuel line blockage
        if ((startsEngine === false || stoppedSuddenly) &&
            (text.includes("fuel") || text.includes("petrol") || text.includes("diesel") || text.includes("empty tank") || text.includes("sputter"))) {
            return {
                problem: "Fuel Exhaustion / Delivery Issue",
                confidence: 86,
                recommendedServiceKey: "FUEL",
                recommendedServiceName: "Emergency Fuel Delivery",
                estimatedCostRange: "₹400 - ₹850",
                severity: "Medium",
                actionSteps: [
                    "Check fuel indicator level",
                    "Avoid prolonged cranking which may draw sediment into fuel lines",
                    "Mechanic will deliver emergency 5L fuel supply"
                ],
                explanation: "Engine sputtering followed by loss of power typically indicates fuel starvation in the combustion chamber."
            };
        }
        // Rule 4: Overheating / Coolant leak
        if (smokeOrHeat ||
            text.includes("smoke") ||
            text.includes("overheat") ||
            text.includes("temperature") ||
            text.includes("steam") ||
            text.includes("coolant")) {
            return {
                problem: "Engine Overheating / Coolant Leak",
                confidence: 91,
                recommendedServiceKey: "OVERHEATING",
                recommendedServiceName: "Coolant & Engine Cooling Repair",
                estimatedCostRange: "₹500 - ₹1,200",
                severity: "High",
                actionSteps: [
                    "TURN OFF ENGINE IMMEDIATELY to prevent head gasket damage",
                    "DO NOT open the radiator cap while the engine is hot",
                    "Mechanic will inspect coolant reservoir and radiator hoses"
                ],
                explanation: "Steam, sweet-smelling fumes, or elevated temp gauge signals failure in the liquid cooling loop or radiator fan system."
            };
        }
        // Rule 5: Accident / Structural damage -> Towing needed
        if (stoppedSuddenly && (text.includes("accident") || text.includes("hit") || text.includes("towing") || text.includes("breakdown") || text.includes("stuck"))) {
            return {
                problem: "Severe Mechanical Malfunction / Towing Needed",
                confidence: 88,
                recommendedServiceKey: "TOWING",
                recommendedServiceName: "Emergency Flatbed Towing",
                estimatedCostRange: "₹1,200 - ₹3,000",
                severity: "Critical",
                actionSteps: [
                    "Move to a safe roadside location away from active traffic",
                    "Turn on hazard blinkers",
                    "Flatbed towing unit will safely transport your vehicle to the nearest certified workshop"
                ],
                explanation: "Major drive-train, clutch, or axle failures prevent safe roadside repair and require flatbed transport."
            };
        }
        // Rule 6: Engine / General mechanical trouble
        if (text.includes("engine") || text.includes("noise") || text.includes("vibration") || text.includes("oil")) {
            return {
                problem: "Engine System Anomaly",
                confidence: 82,
                recommendedServiceKey: "ENGINE",
                recommendedServiceName: "On-Demand Mechanic Inspection",
                estimatedCostRange: "₹500 - ₹1,500",
                severity: "High",
                actionSteps: [
                    "Keep ignition off",
                    "Check underneath for oil or liquid leaks",
                    "Certified technician will conduct multi-point diagnostics on site"
                ],
                explanation: "Unusual engine vibrations or dashboard warning indicators suggest sensor or mechanical component wear."
            };
        }
        // Default Fallback
        return {
            problem: "General Breakdown / Electrical Check",
            confidence: 78,
            recommendedServiceKey: "ELECTRICAL",
            recommendedServiceName: "Electrical & On-Site Repair",
            estimatedCostRange: "₹400 - ₹1,000",
            severity: "Medium",
            actionSteps: [
                "Stay near your vehicle in a secure location",
                "Mechanic will perform complete physical diagnostic upon arrival"
            ],
            explanation: "Based on the reported symptoms, an on-site technician will run diagnostic checks to identify the root cause."
        };
    }
}
exports.AIService = AIService;
