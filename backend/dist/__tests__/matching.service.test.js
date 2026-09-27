"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const matching_service_js_1 = require("../services/matching.service.js");
(0, vitest_1.describe)("MatchingService — Intelligent Proximity & Skill Matching Algorithm", () => {
    const customerLoc = { customerLat: 13.0827, customerLng: 80.2707 };
    // TEST 1: Customer 1 km from Mechanic A vs 8 km from Mechanic B (Both available & compatible)
    (0, vitest_1.it)("TEST 1: should prioritize 1 km mechanic over 8 km mechanic when both are compatible and available", () => {
        const mechA = {
            id: "mech-A",
            userId: "user-A",
            user: { name: "Mechanic A (1km)" },
            skillsJson: JSON.stringify(["Battery", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 4.5,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.0910, // ~1 km
            lng: 80.2720
        };
        const mechB = {
            id: "mech-B",
            userId: "user-B",
            user: { name: "Mechanic B (8km)" },
            skillsJson: JSON.stringify(["Battery", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 4.9, // Higher rating but farther
            totalRatings: 50,
            experienceYears: 10,
            hourlyRate: 400,
            lat: 13.1500, // ~8 km
            lng: 80.3100
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechA, mechB], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(ranked.length).toBe(2);
        (0, vitest_1.expect)(ranked[0].mechanicId).toBe("mech-A");
        (0, vitest_1.expect)(ranked[0].distanceKm).toBeLessThan(2);
        (0, vitest_1.expect)(ranked[1].mechanicId).toBe("mech-B");
        (0, vitest_1.expect)(ranked[0].matchScore).toBeGreaterThan(ranked[1].matchScore);
    });
    // TEST 2: Customer 2 km from Mechanic A vs 5 km from Mechanic B
    (0, vitest_1.it)("TEST 2: should select 2 km mechanic over 5 km mechanic", () => {
        const mechA = {
            id: "mech-A2",
            userId: "user-A2",
            user: { name: "Mechanic A (2km)" },
            skillsJson: JSON.stringify(["Tyre", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 15,
            experienceYears: 4,
            hourlyRate: 300,
            lat: 13.0980, // ~2 km
            lng: 80.2750
        };
        const mechB = {
            id: "mech-B2",
            userId: "user-B2",
            user: { name: "Mechanic B (5km)" },
            skillsJson: JSON.stringify(["Tyre", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 4.7,
            totalRatings: 30,
            experienceYears: 6,
            hourlyRate: 350,
            lat: 13.1250, // ~5 km
            lng: 80.2900
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechA, mechB], {
            ...customerLoc,
            serviceCategoryKey: "TYRE"
        });
        (0, vitest_1.expect)(ranked[0].mechanicId).toBe("mech-A2");
    });
    // TEST 3: Closer mechanic NOT compatible vs farther mechanic compatible
    (0, vitest_1.it)("TEST 3: should prefer farther compatible mechanic (1.5km) over closer incompatible mechanic (0.8km)", () => {
        const mechIncompatible = {
            id: "mech-incomp",
            userId: "user-inc",
            user: { name: "Incompatible Mechanic (0.8km)" },
            skillsJson: JSON.stringify(["AC Repair"]), // Lacks Battery / General Service
            isOnline: true,
            isVerified: true,
            rating: 4.8,
            totalRatings: 30,
            experienceYears: 7,
            hourlyRate: 350,
            lat: 13.0880, // ~0.8 km
            lng: 80.2710
        };
        const mechCompatible = {
            id: "mech-comp",
            userId: "user-comp",
            user: { name: "Compatible Mechanic (1.5km)" },
            skillsJson: JSON.stringify(["Battery", "Electrical"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 25,
            experienceYears: 5,
            hourlyRate: 320,
            lat: 13.0950, // ~1.5 km
            lng: 80.2730
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechIncompatible, mechCompatible], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(ranked[0].mechanicId).toBe("mech-comp");
    });
    // TEST 4: Closest mechanic is BUSY (2 active jobs) vs available second closest
    (0, vitest_1.it)("TEST 4: should filter out busy mechanic (2 active jobs) and select available mechanic", () => {
        const mechBusy = {
            id: "mech-busy",
            userId: "user-busy",
            user: { name: "Busy Mechanic (0.5km)" },
            skillsJson: JSON.stringify(["Battery", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 5.0,
            totalRatings: 100,
            experienceYears: 12,
            hourlyRate: 500,
            lat: 13.0840, // ~0.5 km
            lng: 80.2710,
            _count: { requests: 2 } // Busy with 2 jobs
        };
        const mechFree = {
            id: "mech-free",
            userId: "user-free",
            user: { name: "Free Mechanic (1.8km)" },
            skillsJson: JSON.stringify(["Battery", "General Service"]),
            isOnline: true,
            isVerified: true,
            rating: 4.5,
            totalRatings: 20,
            experienceYears: 4,
            hourlyRate: 300,
            lat: 13.0970, // ~1.8 km
            lng: 80.2740,
            _count: { requests: 0 } // Free
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechBusy, mechFree], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(ranked.length).toBe(1);
        (0, vitest_1.expect)(ranked[0].mechanicId).toBe("mech-free");
    });
    // TEST 5: Closest mechanic is OFFLINE vs farther available mechanic
    (0, vitest_1.it)("TEST 5: should return null for offline mechanic and select available mechanic", () => {
        const mechOffline = {
            id: "mech-off",
            userId: "user-off",
            user: { name: "Offline Mechanic (0.3km)" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: false,
            isVerified: true,
            rating: 4.9,
            totalRatings: 50,
            experienceYears: 8,
            hourlyRate: 350,
            lat: 13.0835,
            lng: 80.2710
        };
        const mechOnline = {
            id: "mech-on",
            userId: "user-on",
            user: { name: "Online Mechanic (2.5km)" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.5,
            totalRatings: 15,
            experienceYears: 3,
            hourlyRate: 300,
            lat: 13.1020,
            lng: 80.2760
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechOffline, mechOnline], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(ranked.length).toBe(1);
        (0, vitest_1.expect)(ranked[0].mechanicId).toBe("mech-on");
    });
    // TEST 6: Three compatible mechanics ranked strictly by distance A(1km) -> B(4km) -> C(9km)
    (0, vitest_1.it)("TEST 6: should rank three compatible mechanics strictly in distance order A(1km) -> B(4km) -> C(9km)", () => {
        const mechA = {
            id: "mech-1km",
            userId: "u1",
            user: { name: "Mechanic 1km" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.0900,
            lng: 80.2720
        };
        const mechB = {
            id: "mech-4km",
            userId: "u2",
            user: { name: "Mechanic 4km" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.1150,
            lng: 80.2850
        };
        const mechC = {
            id: "mech-9km",
            userId: "u3",
            user: { name: "Mechanic 9km" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.1550,
            lng: 80.3150
        };
        const ranked = matching_service_js_1.MatchingService.rankMechanics([mechC, mechA, mechB], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(ranked.map(r => r.mechanicId)).toEqual(["mech-1km", "mech-4km", "mech-9km"]);
    });
    // TEST 7: Dynamic location update changes candidate ranking
    (0, vitest_1.it)("TEST 7: should update rank when mechanic location moves closer to customer", () => {
        let mechB = {
            id: "mech-B-movable",
            userId: "u-movable",
            user: { name: "Movable Mechanic B" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.1500, // Starts at ~8km
            lng: 80.3100
        };
        const mechA = {
            id: "mech-A-static",
            userId: "u-static",
            user: { name: "Static Mechanic A" },
            skillsJson: JSON.stringify(["Battery"]),
            isOnline: true,
            isVerified: true,
            rating: 4.6,
            totalRatings: 20,
            experienceYears: 5,
            hourlyRate: 300,
            lat: 13.1000, // ~2km
            lng: 80.2750
        };
        let rankedInitial = matching_service_js_1.MatchingService.rankMechanics([mechA, mechB], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(rankedInitial[0].mechanicId).toBe("mech-A-static");
        // Move Mechanic B closer to customer (~0.5km)
        mechB.lat = 13.0840;
        mechB.lng = 80.2710;
        let rankedAfterMove = matching_service_js_1.MatchingService.rankMechanics([mechA, mechB], {
            ...customerLoc,
            serviceCategoryKey: "BATTERY"
        });
        (0, vitest_1.expect)(rankedAfterMove[0].mechanicId).toBe("mech-B-movable");
    });
});
