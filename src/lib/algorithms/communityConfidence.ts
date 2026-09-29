// ============================================================
// Community Confidence Calculator
// ============================================================
// This calculates how confident we are that an issue is REAL,
// based on what the community says about it.
//
// The formula:
// Confidence = base + confirmation_boost - dispute_penalty
//
// - Base: 50 if issue has photo evidence, 40 if no photos
// - Confirmation boost: +8 × ln(1 + confirmations)
//   (logarithmic so first few confirmations matter most)
// - Dispute penalty: -16 per dispute
//   (disputes strongly reduce confidence)
//
// Result is clamped between 5% and 99%
// ============================================================

/**
 * calculateCommunityConfidence
 *
 * Think of this as a "trust meter" for an issue.
 *
 * Example scenarios:
 * - New issue with photo, 0 confirms, 0 disputes = 50%
 * - Issue with photo, 5 confirms, 0 disputes = 50 + 14 = 64%
 * - Issue with photo, 10 confirms, 1 dispute = 50 + 19 - 16 = 53%
 * - Issue without photo, 0 confirms, 2 disputes = 40 + 0 - 32 = 8%
 *
 * @param confirmations - Number of people who confirmed the issue exists
 * @param disputes - Number of people who say the issue is fake/resolved
 * @param hasPhotoEvidence - Whether the original report included photos
 * @returns A number between 5 and 99 representing confidence percentage
 */
export function calculateCommunityConfidence(
  confirmations: number,
  disputes: number,
  hasPhotoEvidence: boolean
): number {
  // Start with a base score
  // Photos make an issue more credible right from the start
  const base = hasPhotoEvidence ? 50 : 40;

  // Confirmations boost confidence (logarithmic curve)
  // This means:
  //   1 confirmation  → +5 points
  //   5 confirmations → +14 points
  //   10 confirmations → +19 points
  //   50 confirmations → +31 points
  // First few confirmations matter most (diminishing returns)
  const confirmationBoost = Math.floor(8 * Math.log(1 + confirmations));

  // Disputes reduce confidence significantly
  // Each dispute = -16 points (disputes are taken seriously)
  const disputePenalty = disputes * 16;

  // Calculate raw score
  const rawScore = base + confirmationBoost - disputePenalty;

  // Clamp between 5 and 99 (never 0% or 100%)
  // We never say 0% because there might be something there
  // We never say 100% because only field verification can be 100% sure
  return Math.min(99, Math.max(5, rawScore));
}

/**
 * getConfidenceLabel - Convert a number into a human-readable label
 *
 * @param confidence - The confidence percentage (5-99)
 * @returns Object with label text and color for UI badges
 */
export function getConfidenceLabel(confidence: number): {
  label: string;
  color: string;
  description: string;
} {
  if (confidence >= 80) {
    return {
      label: 'High Confidence',
      color: '#22c55e', // Green
      description: 'Strong community agreement that this issue exists',
    };
  }
  if (confidence >= 60) {
    return {
      label: 'Moderate Confidence',
      color: '#eab308', // Yellow
      description: 'Multiple community members have confirmed this issue',
    };
  }
  if (confidence >= 40) {
    return {
      label: 'Developing',
      color: '#f97316', // Orange
      description: 'Awaiting more community verification',
    };
  }
  return {
    label: 'Low Confidence',
    color: '#ef4444', // Red
    description: 'Few confirmations or active disputes exist',
  };
}
