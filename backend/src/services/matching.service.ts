import { calculateDistanceKm, calculateEtaMinutes } from "../utils/distance.js";

export interface MechanicMatchInput {
  customerLat: number;
  customerLng: number;
  serviceCategoryKey: string;
  requiredVehicleType?: string;
}

export interface MatchedMechanicResult {
  mechanicId: string;
  userId: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRatings: number;
  experienceYears: number;
  hourlyRate: number;
  skills: string[];
  distanceKm: number;
  etaMinutes: number;
  matchScore: number; // 0 to 100%
  breakdownScore: {
    distanceScore: number;
    skillScore: number;
    ratingScore: number;
    availabilityScore: number;
  };
  lat: number;
  lng: number;
}

export class MatchingService {
  /**
   * Match available mechanics based on distance, skill match, rating, and availability
   */
  public static calculateMatchScore(
    mechanic: {
      id: string;
      userId: string;
      user: { name: string; phone?: string | null; avatar?: string | null };
      skillsJson: string;
      isOnline: boolean;
      isVerified: boolean;
      rating: number;
      totalRatings: number;
      experienceYears: number;
      hourlyRate: number;
      lat?: number | null;
      lng?: number | null;
      _count?: { requests: number };
    },
    input: MechanicMatchInput
  ): MatchedMechanicResult | null {
    if (!mechanic.isOnline || !mechanic.isVerified) {
      return null; // Only online and verified mechanics can match
    }

    const mechLat = mechanic.lat ?? 13.0827; // Default Chennai demo coords if not set
    const mechLng = mechanic.lng ?? 80.2707;

    const distanceKm = calculateDistanceKm(input.customerLat, input.customerLng, mechLat, mechLng);
    const etaMinutes = calculateEtaMinutes(distanceKm);

    // Max search radius: 25 km
    if (distanceKm > 25) {
      return null;
    }

    // 1. Distance Score (40% weight): 0km = 40 pts, 25km = 0 pts
    const distanceScore = Math.max(0, (1 - distanceKm / 25) * 40);

    // 2. Skill Score (30% weight)
    let skills: string[] = [];
    try {
      skills = JSON.parse(mechanic.skillsJson);
    } catch {
      skills = ["General Service"];
    }

    const reqCategory = input.serviceCategoryKey.toUpperCase();
    const hasSkillMatch = skills.some(s => s.toUpperCase().includes(reqCategory) || s.toUpperCase().includes("GENERAL"));
    const skillScore = hasSkillMatch ? 30 : 15;

    // 3. Rating Score (15% weight): 5 stars = 15 pts, 0 stars = 0 pts
    const ratingScore = (mechanic.rating / 5) * 15;

    // 4. Availability & Workload Score (15% weight)
    const activeJobs = mechanic._count?.requests || 0;
    const availabilityScore = Math.max(0, 15 - activeJobs * 5);

    const totalMatchScore = Math.round(distanceScore + skillScore + ratingScore + availabilityScore);

    return {
      mechanicId: mechanic.id,
      userId: mechanic.userId,
      name: mechanic.user.name,
      phone: mechanic.user.phone || "+91 98765 43210",
      avatar: mechanic.user.avatar || undefined,
      rating: mechanic.rating,
      totalRatings: mechanic.totalRatings,
      experienceYears: mechanic.experienceYears,
      hourlyRate: mechanic.hourlyRate,
      skills,
      distanceKm,
      etaMinutes,
      matchScore: Math.min(99, Math.max(50, totalMatchScore)),
      breakdownScore: {
        distanceScore: Math.round(distanceScore),
        skillScore: Math.round(skillScore),
        ratingScore: Math.round(ratingScore),
        availabilityScore: Math.round(availabilityScore)
      },
      lat: mechLat,
      lng: mechLng
    };
  }
}
