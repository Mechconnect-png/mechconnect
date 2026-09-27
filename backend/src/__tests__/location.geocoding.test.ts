import { describe, it, expect } from 'vitest';
import { MatchingService } from '../services/matching.service.js';
import { calculateDistanceKm } from '../utils/distance.js';

describe('Location Geocoding & Manual Location Matching Engine', () => {

  const validateCoordinates = (lat: any, lng: any): boolean => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
    const numLat = Number(lat);
    const numLng = Number(lng);
    return (
      !isNaN(numLat) &&
      !isNaN(numLng) &&
      numLat >= -90 &&
      numLat <= 90 &&
      numLng >= -180 &&
      numLng <= 180 &&
      (numLat !== 0 || numLng !== 0) &&
      numLat !== numLng
    );
  };

  it('1. should validate valid geocoded coordinates correctly', () => {
    expect(validateCoordinates(11.0168, 76.9558)).toBe(true); // Gandhipuram, Coimbatore
    expect(validateCoordinates(13.0890, 80.2750)).toBe(true); // Anna Nagar, Chennai
    expect(validateCoordinates(9.9252, 78.1198)).toBe(true);  // Madurai
  });

  it('2. should reject invalid, swapped, or null coordinates', () => {
    expect(validateCoordinates(null, 76.9558)).toBe(false);
    expect(validateCoordinates(11.0168, undefined)).toBe(false);
    expect(validateCoordinates('invalid', 76.9558)).toBe(false);
    expect(validateCoordinates(11.0168, 11.0168)).toBe(false); // Swapped/identical lat/lng error
    expect(validateCoordinates(190, 80.2750)).toBe(false);    // Lat out of range
    expect(validateCoordinates(13.0890, -200)).toBe(false);    // Lng out of range
  });

  it('3. should prioritize nearest mechanic when customer enters Gandhipuram, Coimbatore', () => {
    // Customer manually entered Gandhipuram, Coimbatore
    const customerLat = 11.0168;
    const customerLng = 76.9558;

    const mockMechanics = [
      {
        id: 'mech-gandhipuram',
        userId: 'u1',
        user: { name: 'Coimbatore Auto Clinic' },
        skillsJson: '["General Service", "Battery", "Tyre"]',
        isOnline: true,
        isVerified: true,
        rating: 4.8,
        totalRatings: 25,
        experienceYears: 5,
        hourlyRate: 350,
        lat: 11.0200, // ~0.5 km away (Gandhipuram)
        lng: 76.9600,
        _count: { requests: 0 }
      },
      {
        id: 'mech-rspuram',
        userId: 'u2',
        user: { name: 'RS Puram Garage' },
        skillsJson: '["General Service", "Battery"]',
        isOnline: true,
        isVerified: true,
        rating: 4.9,
        totalRatings: 40,
        experienceYears: 7,
        hourlyRate: 400,
        lat: 11.0084, // ~1.5 km away (RS Puram)
        lng: 76.9463,
        _count: { requests: 0 }
      },
      {
        id: 'mech-chennai',
        userId: 'u3',
        user: { name: 'Chennai Central Motors' },
        skillsJson: '["General Service"]',
        isOnline: true,
        isVerified: true,
        rating: 5.0,
        totalRatings: 100,
        experienceYears: 10,
        hourlyRate: 500,
        lat: 13.0890, // ~450 km away (Chennai)
        lng: 80.2750,
        _count: { requests: 0 }
      }
    ];

    const results = MatchingService.rankMechanics(mockMechanics, {
      customerLat,
      customerLng,
      serviceCategoryKey: 'BATTERY'
    });

    // Mech in Gandhipuram (0.5km) must be ranked #1
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].mechanicId).toBe('mech-gandhipuram');
    expect(results[0].rank).toBe(1);

    // Mech in Chennai (450km) must be filtered out (>25km cutoff)
    const chennaiMech = results.find(r => r.mechanicId === 'mech-chennai');
    expect(chennaiMech).toBeUndefined();
  });

  it('4. should compute accurate Haversine distance for manual locations', () => {
    // Gandhipuram (11.0168, 76.9558) to RS Puram (11.0084, 76.9463)
    const distKm = calculateDistanceKm(11.0168, 76.9558, 11.0084, 76.9463);
    expect(distKm).toBeGreaterThan(1.0);
    expect(distKm).toBeLessThan(2.5);
  });
});
