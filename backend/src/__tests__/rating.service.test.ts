import { describe, it, expect } from "vitest";

describe("Rating Service Logic & Aggregate Score Calculation", () => {
  it("should calculate correct average mechanic rating from multiple reviews", () => {
    const ratings = [
      { stars: 5 },
      { stars: 4 },
      { stars: 5 },
      { stars: 4 },
      { stars: 5 }
    ];

    const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
    const avg = sum / ratings.length;
    const roundedAvg = Math.round(avg * 10) / 10;

    expect(roundedAvg).toBe(4.6);
  });

  it("should compute correct rating score in matching algorithm formula", () => {
    const mechanicRating = 4.8;
    const ratingScore = Math.round((mechanicRating / 5.0) * 15);
    expect(ratingScore).toBe(14);
  });

  it("should handle 5-star perfect rating score", () => {
    const mechanicRating = 5.0;
    const ratingScore = Math.round((mechanicRating / 5.0) * 15);
    expect(ratingScore).toBe(15);
  });
});
