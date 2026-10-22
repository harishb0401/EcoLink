import { calculateHaversineDistance, estimateLocationDistance } from '../utils/distance.js';

/**
 * Matches waste lots with a specific recycler profile.
 * Filters by CPCB status, accepted categories, and calculates real distance.
 */
export function matchLotsToRecycler(lots = [], recyclerProfile) {
  if (!recyclerProfile) {
    return [];
  }

  // Recycler must be VERIFIED (case-insensitive check)
  const profileStatus = (recyclerProfile.status || recyclerProfile.cpcb_status || '').toUpperCase();
  const isVerified = profileStatus === 'VERIFIED';
  if (!isVerified) {
    return [];
  }

  const rawCats = recyclerProfile.categories || recyclerProfile.accepted_categories || [];
  const acceptedCats = Array.isArray(rawCats) ? rawCats : [];

  const eligibleOpenStatuses = [
    'AVAILABLE',
    'Available',
    'AWAITING_OFFERS',
    'OFFERS_RECEIVED',
    'SUBMITTED',
    'REGISTERED',
    'Pending Review',
    'PENDING_REVIEW'
  ];

  return lots
    .filter(lot => {
      // Must be open for intake / offers
      const isLotOpen = eligibleOpenStatuses.includes(lot.status) || !lot.status;
      if (!isLotOpen) return false;

      // Category matching
      if (acceptedCats.length === 0) return true; // Accepts all if unconstrained
      return acceptedCats.some(
        cat =>
          cat.toLowerCase().includes((lot.category || '').toLowerCase()) ||
          (lot.category || '').toLowerCase().includes(cat.toLowerCase())
      );
    })
    .map(lot => {
      let distanceKm = null;

      // Calculate distance if both points have coordinates
      if (
        lot.latitude !== null &&
        lot.latitude !== undefined &&
        lot.longitude !== null &&
        lot.longitude !== undefined &&
        recyclerProfile.latitude !== null &&
        recyclerProfile.latitude !== undefined &&
        recyclerProfile.longitude !== null &&
        recyclerProfile.longitude !== undefined
      ) {
        distanceKm = calculateHaversineDistance(
          recyclerProfile.latitude,
          recyclerProfile.longitude,
          lot.latitude,
          lot.longitude
        );
      } else {
        distanceKm = estimateLocationDistance(
          recyclerProfile.facility_address || recyclerProfile.location_text || recyclerProfile.location,
          lot.location || lot.location_text
        );
      }

      // Compute dynamic match score
      let matchScore = 75;
      if (distanceKm !== null && distanceKm <= 10) {
        matchScore += 20;
      } else if (distanceKm !== null && distanceKm <= 30) {
        matchScore += 10;
      }

      return {
        ...lot,
        distance_km: distanceKm,
        matchScore: Math.min(matchScore, 99)
      };
    });
}

/**
 * Calculates distance between a recycler and a waste lot
 */
export function computeDistanceBetween(recycler, lot) {
  if (
    recycler?.latitude &&
    recycler?.longitude &&
    lot?.latitude &&
    lot?.longitude
  ) {
    return calculateHaversineDistance(
      recycler.latitude,
      recycler.longitude,
      lot.latitude,
      lot.longitude
    );
  }

  return estimateLocationDistance(
    recycler?.facility_address || recycler?.location || recycler?.location_text || recycler?.address,
    lot?.location || lot?.location_text
  );
}
