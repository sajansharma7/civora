// ============================================================
// Priority Engine - Calculates how urgent an issue is
// ============================================================
// This gives every issue a score from 0 to 100.
// Higher score = more urgent = gets attention faster.
//
// The score is based on:
// - How severe the issue is (road collapse vs minor crack)
// - How many people confirmed it's real
// - How dangerous it is to public safety
// - How many people are affected
// - How long it's been open without resolution
// - How many people are following it
// - Whether it's an emergency
// ============================================================

// Input data needed to calculate priority
export interface PriorityInput {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confirmationsCount: number;
  safetyRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  affectedPeopleEst: number;
  createdAt: Date;
  followersCount: number;
  isEmergency: boolean;
}

// What the engine returns
export interface PriorityResult {
  score: number;                                    // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';  // Human-readable bracket
  explanation: string;                               // Why this score
}

/**
 * calculatePriority - The main function that scores an issue
 *
 * HOW IT WORKS (simple breakdown):
 * 1. Severity gives 0-25 points (how bad is the damage?)
 * 2. Confirmations give 0-20 points (do other people agree it's real?)
 * 3. Safety risk gives 0-15 points (is someone going to get hurt?)
 * 4. Affected people give 0-15 points (how many people suffer?)
 * 5. Age gives 0-10 points (old unresolved issues get more urgent)
 * 6. Followers give 0-5 points (community interest)
 * 7. Emergency adds 15 bonus points (always becomes CRITICAL)
 *
 * Maximum possible = 25 + 20 + 15 + 15 + 10 + 5 + 15 = 105, capped at 100
 */
export function calculatePriority(input: PriorityInput): PriorityResult {
  // ---- Step 1: Severity Points (0 to 25) ----
  // Think of this as: How bad is the physical damage?
  const severityPoints: Record<string, number> = {
    LOW: 5,       // Minor cosmetic issue
    MEDIUM: 12,   // Noticeable problem
    HIGH: 20,     // Serious damage
    CRITICAL: 25, // Dangerous/life-threatening
  };
  const severityScore = severityPoints[input.severity] || 12;

  // ---- Step 2: Confirmation Points (0 to 20) ----
  // Each person who confirms = 2 points, up to max 20
  // More confirmations = more people agree it's real
  const confirmationScore = Math.min(20, input.confirmationsCount * 2);

  // ---- Step 3: Safety Risk Points (0 to 15) ----
  // How likely is someone to get hurt?
  const safetyPoints: Record<string, number> = {
    LOW: 0,      // No safety concern
    MEDIUM: 5,   // Some risk
    HIGH: 10,    // Significant danger
    EXTREME: 15, // Immediate threat to life
  };
  const safetyScore = safetyPoints[input.safetyRisk] || 5;

  // ---- Step 4: Affected People Points (0 to 15) ----
  // More people affected = higher priority
  let peopleScore = 3; // Default for < 50 people
  if (input.affectedPeopleEst > 500) {
    peopleScore = 15;   // Affects a large community
  } else if (input.affectedPeopleEst > 200) {
    peopleScore = 11;   // Affects a neighborhood
  } else if (input.affectedPeopleEst >= 50) {
    peopleScore = 7;    // Affects a block
  }

  // ---- Step 5: Age Escalation Points (0 to 10) ----
  // Issues that stay open too long get more urgent
  // +1 point for every 2 days the issue has been open
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(input.createdAt).getTime()) / millisecondsPerDay)
  );
  const ageScore = Math.min(10, Math.floor(ageInDays / 2));

  // ---- Step 6: Follower Points (0 to 5) ----
  // Every 3 followers = 1 point (community interest indicator)
  const followerScore = Math.min(5, Math.floor(input.followersCount / 3));

  // ---- Step 7: Emergency Bonus (0 or 15) ----
  // If flagged as emergency, add 15 bonus points
  const emergencyBonus = input.isEmergency ? 15 : 0;

  // ---- Calculate Total ----
  const rawScore =
    severityScore +
    confirmationScore +
    safetyScore +
    peopleScore +
    ageScore +
    followerScore +
    emergencyBonus;

  // Cap at 100 (can't go higher)
  const score = Math.min(100, rawScore);

  // ---- Determine Priority Level ----
  // Emergency always = CRITICAL regardless of score
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 80 || input.isEmergency) {
    level = 'CRITICAL';  // Needs immediate attention
  } else if (score >= 60) {
    level = 'HIGH';      // Should be addressed soon
  } else if (score >= 35) {
    level = 'MEDIUM';    // Normal priority
  }
  // Below 35 stays 'LOW'

  // ---- Build Human-Readable Explanation ----
  // This tells municipal staff WHY the issue is this priority
  const reasons: string[] = [];

  if (input.isEmergency) {
    reasons.push('declared active public emergency');
  }
  if (input.safetyRisk === 'EXTREME' || input.safetyRisk === 'HIGH') {
    reasons.push(`${input.safetyRisk.toLowerCase()} safety hazard`);
  }
  if (input.confirmationsCount > 10) {
    reasons.push(`${input.confirmationsCount} community confirmations`);
  }
  if (input.affectedPeopleEst >= 200) {
    reasons.push(`impacts ~${input.affectedPeopleEst}+ residents`);
  }
  if (ageInDays >= 6) {
    reasons.push(`unresolved for ${ageInDays} days`);
  }
  if (input.followersCount >= 9) {
    reasons.push(`${input.followersCount} citizens following`);
  }

  const explanation = `${level} Priority (${score}/100) driven by: ${
    reasons.length > 0
      ? reasons.join(', ')
      : 'standard evaluation parameters'
  }.`;

  return { score, level, explanation };
}
