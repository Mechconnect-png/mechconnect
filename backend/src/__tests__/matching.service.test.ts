import { describe, it, expect } from "vitest";
import { MatchingService } from "../services/matching.service.js";

describe("MatchingService — Mechanic Intelligent Matching Algorithm", () => {
  it("should calculate match score for nearby verified online mechanic", () => {
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

    const match = MatchingService.calculateMatchScore(mockMechanic, {
      customerLat: 13.0827,
      customerLng: 80.2707,
      serviceCategoryKey: "BATTERY"
    });

    expect(match).not.toBeNull();
    expect(match?.matchScore).toBeGreaterThanOrEqual(80);
    expect(match?.distanceKm).toBeLessThan(2);
  });

  it("should return null if mechanic is offline", () => {
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

    const match = MatchingService.calculateMatchScore(mockMechanic, {
      customerLat: 13.0827,
      customerLng: 80.2707,
      serviceCategoryKey: "BATTERY"
    });

    expect(match).toBeNull();
  });
});
