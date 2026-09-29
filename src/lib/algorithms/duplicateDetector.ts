// ============================================================
// Duplicate Detection Engine
// ============================================================
// When someone reports a new issue, this checks if a similar
// issue already exists nearby. This prevents duplicate reports
// and helps cluster related complaints together.
//
// HOW IT WORKS:
// 1. Check if any existing issues are within 350 meters
// 2. Compare the text (title + description) for similarity
// 3. Check if they're in the same category
// 4. Combine all three scores into one "composite" score
// 5. If composite score >= 0.55, warn the user about a potential duplicate
// ============================================================

/**
 * haversineDistanceMeters - Calculate distance between two GPS points
 *
 * The Earth is a sphere (roughly). This formula calculates the
 * shortest distance between two points on a sphere's surface.
 *
 * Think of it like: "How far apart are these two map pins?"
 *
 * @param lat1 - Latitude of point 1 (e.g., 28.2096)
 * @param lon1 - Longitude of point 1 (e.g., 83.9856)
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in meters (e.g., 150 means 150 meters apart)
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters

  // Convert degrees to radians (math requires radians)
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1); // Difference in latitude
  const dLon = toRadians(lon2 - lon1); // Difference in longitude

  // Haversine formula (don't worry about the math, just trust it works!)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Round to nearest meter
}

/**
 * computeTextSimilarity - Compare two pieces of text
 *
 * Uses "Jaccard Similarity" which is a simple but effective method:
 * 1. Break both texts into individual words
 * 2. Count how many words appear in BOTH texts
 * 3. Divide by total unique words across both texts
 *
 * Example:
 * Text A: "broken road near lakeside"
 * Text B: "damaged road at lakeside area"
 * Common words: "road", "lakeside" = 2
 * All unique words: "broken", "road", "near", "lakeside", "damaged", "at", "area" = 7
 * Similarity = 2/7 = 0.29 (29% similar)
 *
 * @returns Number between 0 (completely different) and 1 (identical)
 */
export function computeTextSimilarity(textA: string, textB: string): number {
  // Step 1: Convert to lowercase and split into words
  const tokenize = (str: string): string[] =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(/\s+/)                 // Split by spaces
      .filter(Boolean);             // Remove empty strings

  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  // If either text is empty, they're 0% similar
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  // Step 2: Find words that appear in BOTH texts
  const intersection = new Set(
    [...tokensA].filter((word) => tokensB.has(word))
  );

  // Step 3: Find ALL unique words across both texts
  const union = new Set([...tokensA, ...tokensB]);

  // Step 4: Calculate similarity ratio
  return intersection.size / union.size;
}

/**
 * evaluateDuplicateMatch - Check if a new report might be a duplicate
 *
 * Combines three signals:
 * 1. TEXT SIMILARITY (50% weight) - Are they describing the same problem?
 * 2. GEOGRAPHIC PROXIMITY (30% weight) - Are they in the same location?
 * 3. CATEGORY MATCH (20% weight) - Same type of issue?
 *
 * @param newReport - The issue someone is trying to submit
 * @param existingIssue - An existing issue in the database
 * @returns Whether it's a potential duplicate and the confidence score
 */
export function evaluateDuplicateMatch(
  newReport: {
    title: string;
    description: string;
    categoryId: string;
    lat: number;
    lng: number;
  },
  existingIssue: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    lat: number;
    lng: number;
    trackingCode?: string;
    confirmationsCount?: number;
  }
): {
  isDuplicateCandidate: boolean;
  compositeScore: number;
  distanceMeters: number;
} {
  // Step 1: Check geographic distance
  const distance = haversineDistanceMeters(
    newReport.lat,
    newReport.lng,
    existingIssue.lat,
    existingIssue.lng
  );

  // If more than 350 meters away, it's definitely not a duplicate
  if (distance > 350) {
    return {
      isDuplicateCandidate: false,
      compositeScore: 0,
      distanceMeters: distance,
    };
  }

  // Step 2: Calculate geographic proximity score
  // At 0 meters = 1.0 (same spot), at 350 meters = 0.0 (too far)
  const geoScore = Math.max(0, 1 - distance / 350);

  // Step 3: Calculate text similarity
  const textScore = computeTextSimilarity(
    `${newReport.title} ${newReport.description}`,
    `${existingIssue.title} ${existingIssue.description}`
  );

  // Step 4: Check if categories match
  // Same category = 1.0, different = 0.2 (still some score because
  // people sometimes miscategorize)
  const categoryScore =
    newReport.categoryId === existingIssue.categoryId ? 1.0 : 0.2;

  // Step 5: Calculate composite score with weights
  const compositeScore =
    0.5 * textScore +   // Text is most important (50%)
    0.3 * geoScore +    // Location is second (30%)
    0.2 * categoryScore; // Category is third (20%)

  return {
    isDuplicateCandidate: compositeScore >= 0.55, // 55% = likely duplicate
    compositeScore: Number(compositeScore.toFixed(2)),
    distanceMeters: distance,
  };
}

/**
 * findPotentialDuplicates - Search through multiple existing issues
 *
 * This is the main function called by the API.
 * It checks a new report against ALL existing open issues
 * and returns any that might be duplicates, sorted by score.
 */
export function findPotentialDuplicates(
  newReport: {
    title: string;
    description: string;
    categoryId: string;
    lat: number;
    lng: number;
  },
  existingIssues: Array<{
    id: string;
    title: string;
    description: string;
    categoryId: string;
    lat: number;
    lng: number;
    trackingCode?: string;
    confirmationsCount?: number;
  }>
): Array<{
  issueId: string;
  trackingCode?: string;
  title: string;
  compositeScore: number;
  distanceMeters: number;
  confirmationsCount?: number;
}> {
  const candidates: Array<{
    issueId: string;
    trackingCode?: string;
    title: string;
    compositeScore: number;
    distanceMeters: number;
    confirmationsCount?: number;
  }> = [];

  // Check each existing issue
  for (const existing of existingIssues) {
    const result = evaluateDuplicateMatch(newReport, existing);

    if (result.isDuplicateCandidate) {
      candidates.push({
        issueId: existing.id,
        trackingCode: existing.trackingCode,
        title: existing.title,
        compositeScore: result.compositeScore,
        distanceMeters: result.distanceMeters,
        confirmationsCount: existing.confirmationsCount,
      });
    }
  }

  // Sort by highest score first (most likely duplicate on top)
  return candidates.sort((a, b) => b.compositeScore - a.compositeScore);
}
