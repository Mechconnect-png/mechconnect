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
  rank?: number;
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
   * Calculate non-linear distance score (Max 40 points).
   * Strongly penalizes larger travel distances to prioritize nearby mechanics.
   * - 0 to 3 km: 30 to 40 pts
   * - 3 to 7 km: 15 to 30 pts
   * - 7 to 15 km: 3 to 15 pts
   * - 15 to 25 km: 0 to 3 pts
   */
  public static calculateDistanceScore(distanceKm: number): number {
    if (distanceKm <= 3) {
      return 40 - (distanceKm / 3) * 10;
    } else if (distanceKm <= 7) {
      return 30 - ((distanceKm - 3) / 4) * 15;
    } else if (distanceKm <= 15) {
      return 15 - ((distanceKm - 7) / 8) * 12;
    } else if (distanceKm <= 25) {
      return Math.max(0, 3 - ((distanceKm - 15) / 10) * 3);
    }
    return 0;
  }

  /**
   * Match available mechanics based on proximity, skill compatibility, rating, and workload.
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
    // 1. Availability check: Must be online and verified
    if (!mechanic.isOnline || !mechanic.isVerified) {
      return null;
    }

    // 2. Active workload check: Filter out mechanics who are busy with 2+ active jobs
    const activeJobs = mechanic._count?.requests || 0;
    if (activeJobs >= 2) {
      return null;
    }

    // Safe coordinate resolution
    const mechLat = mechanic.lat !== undefined && mechanic.lat !== null ? Number(mechanic.lat) : 13.0890;
    const mechLng = mechanic.lng !== undefined && mechanic.lng !== null ? Number(mechanic.lng) : 80.2750;

    const distanceKm = calculateDistanceKm(input.customerLat, input.customerLng, mechLat, mechLng);
    const etaMinutes = calculateEtaMinutes(distanceKm);

    // Max search cutoff: 25 km
    if (distanceKm > 25) {
      return null;
    }

    // 1. Non-linear Proximity Score (40% max weight)
    const distanceScore = this.calculateDistanceScore(distanceKm);

    // 2. Skill Compatibility Score (30% max weight)
    let skills: string[] = [];
    try {
      skills = JSON.parse(mechanic.skillsJson);
    } catch {
      skills = ["General Service"];
    }

    const reqCategory = (input.serviceCategoryKey || "").toUpperCase();
    const hasExactSkill = skills.some(s => s.toUpperCase().includes(reqCategory));
    const hasGeneralSkill = skills.some(s => s.toUpperCase().includes("GENERAL"));

    let skillScore = 0;
    if (hasExactSkill) {
      skillScore = 30; // 30 points for exact skill match
    } else if (hasGeneralSkill) {
      skillScore = 20; // 20 points for general roadside service
    } else {
      skillScore = 0; // 0 points for incompatible service
    }

    // 3. Rating Score (15% max weight)
    const ratingScore = Math.min(15, (Math.max(0, mechanic.rating) / 5) * 15);

    // 4. Availability & Workload Score (15% max weight)
    const availabilityScore = activeJobs === 0 ? 15 : 5;

    // Total weighted match score
    const rawMatchScore = distanceScore + skillScore + ratingScore + availabilityScore;
    const finalScore = Math.round(Math.min(99, Math.max(10, rawMatchScore)));

    return {
      mechanicId: mechanic.id,
      userId: mechanic.userId,
      name: mechanic.user?.name || "Verified Mechanic",
      phone: mechanic.user?.phone || "+91 98765 43210",
      avatar: mechanic.user?.avatar || undefined,
      rating: mechanic.rating,
      totalRatings: mechanic.totalRatings,
      experienceYears: mechanic.experienceYears,
      hourlyRate: mechanic.hourlyRate,
      skills,
      distanceKm,
      etaMinutes,
      matchScore: finalScore,
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

  /**
   * Ranks candidate mechanics using tiered proximity search (0-3km, 3-7km, 7-15km, 15-25km).
   * Prioritizes nearest suitable available mechanics over distant ones.
   */
  public static rankMechanics(
    mechanics: Array<any>,
    input: MechanicMatchInput
  ): MatchedMechanicResult[] {
    const scoredCandidates = mechanics
      .map(m => this.calculateMatchScore(m, input))
      .filter((m): m is MatchedMechanicResult => m !== null);

    // Sort by Match Score (descending), tie-break by Distance (ascending)
    scoredCandidates.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (Math.abs(scoreDiff) > 1) {
        return scoreDiff;
      }
      return a.distanceKm - b.distanceKm;
    });

    // Assign rank indices and log debug info
    return scoredCandidates.map((candidate, idx) => {
      const rank = idx + 1;
      console.log(
        `[MATCHING ENGINE] Candidate #${rank} (${candidate.name}): ` +
        `dist=${candidate.distanceKm}km (${candidate.breakdownScore.distanceScore}pt), ` +
        `skill=${candidate.breakdownScore.skillScore}pt, ` +
        `rating=${candidate.rating} (${candidate.breakdownScore.ratingScore}pt), ` +
        `avail=${candidate.breakdownScore.availabilityScore}pt => ` +
        `Final Score=${candidate.matchScore}`
      );
      return { ...candidate, rank };
    });
  }
}
