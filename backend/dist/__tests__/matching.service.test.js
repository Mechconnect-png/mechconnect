"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const matching_service_js_1 = require("../services/matching.service.js");
(0, vitest_1.describe)("MatchingService — Mechanic Intelligent Matching Algorithm", () => {
    (0, vitest_1.it)("should calculate match score for nearby verified online mechanic", () => {
        const mockMechanic = {
            id: "mech-1",
            userId: "user-mech-1",
            user: { name: "Karthik Raja", phone: "+919123456789", avatar: null },
            skillsJson: JSON.stringify(["Battery", "Tyre", "Electrical"]),
            isOnline: true,
            isVerified: true,
            rating: 4.9,
            totalRatings: 40,
            experienceYears: 8,
            hourlyRate: 350,
            lat: 13.0850,
            lng: 80.2720
        };
        const match = matching_service_js_1.MatchingService.calculateMatchScore(mockMechanic, {
            customerLat: 13.0827,
            customerLng: 80.2707,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(match).not.toBeNull();
        (0, vitest_1.expect)(match?.matchScore).toBeGreaterThanOrEqual(80);
        (0, vitest_1.expect)(match?.distanceKm).toBeLessThan(2);
    });
    (0, vitest_1.it)("should return null if mechanic is offline", () => {
        const mockMechanic = {
            id: "mech-2",
            userId: "user-mech-2",
            user: { name: "Offline Mechanic", phone: null, avatar: null },
            skillsJson: "[]",
            isOnline: false,
            isVerified: true,
            rating: 4.5,
            totalRatings: 10,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.0850,
            lng: 80.2720
        };
        const match = matching_service_js_1.MatchingService.calculateMatchScore(mockMechanic, {
            customerLat: 13.0827,
            customerLng: 80.2707,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(match).toBeNull();
    });
});
