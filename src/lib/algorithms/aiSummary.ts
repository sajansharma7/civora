// ============================================================
// AI Summary Generator
// ============================================================
// Generates a brief, professional summary of an issue
// for municipal staff to quickly understand what's happening.
//
// This is a lightweight NLP approach (no external AI APIs needed).
// It creates structured summaries from the issue data.
// ============================================================

interface IssueSummaryInput {
  title: string;
  description: string;
  categoryName: string;
  severity: string;
  safetyRisk: string;
  address: string;
  city: string;
  confirmationsCount: number;
  priorityScore: number;
  priorityLevel: string;
  affectedPeopleEst: number;
  createdAt: Date;
}

/**
 * generateIssueSummary - Creates a professional briefing
 *
 * Example output:
 * "ROAD DAMAGE issue reported at Lakeside Road, Pokhara.
 *  HIGH severity with EXTREME safety risk affecting ~200 residents.
 *  Priority Score: 78/100 (HIGH). Confirmed by 12 community members.
 *  Issue open for 5 days."
 */
export function generateIssueSummary(input: IssueSummaryInput): string {
  // Calculate how many days the issue has been open
  const daysOpen = Math.floor(
    (Date.now() - new Date(input.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Build the summary in clear, structured sections
  const parts: string[] = [];

  // Section 1: What and Where
  parts.push(
    `${input.categoryName.toUpperCase()} issue reported at ${input.address}, ${input.city}.`
  );

  // Section 2: Severity and Impact
  parts.push(
    `${input.severity} severity with ${input.safetyRisk} safety risk affecting ~${input.affectedPeopleEst} residents.`
  );

  // Section 3: Priority
  parts.push(
    `Priority Score: ${input.priorityScore}/100 (${input.priorityLevel}).`
  );

  // Section 4: Community Engagement
  if (input.confirmationsCount > 0) {
    parts.push(
      `Confirmed by ${input.confirmationsCount} community member${
        input.confirmationsCount > 1 ? 's' : ''
      }.`
    );
  }

  // Section 5: Age
  if (daysOpen > 0) {
    parts.push(`Issue open for ${daysOpen} day${daysOpen > 1 ? 's' : ''}.`);
  } else {
    parts.push('Reported today.');
  }

  return parts.join(' ');
}

/**
 * extractKeyPhrases - Pull out important words from text
 *
 * Simple keyword extraction by removing common words (stopwords)
 * and returning the most meaningful terms.
 */
export function extractKeyPhrases(text: string, maxPhrases: number = 5): string[] {
  // Common English words that don't carry meaning
  const stopwords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'because', 'but', 'and', 'or', 'if', 'while', 'although', 'this',
    'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
    'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
    'what', 'which', 'who', 'whom', 'whose', 'about', 'also', 'much',
    'many', 'any', 'every', 'still', 'already', 'even', 'well', 'back',
    'around', 'since', 'until', 'along', 'near', 'far', 'away', 'inside',
    'outside', 'up', 'down',
  ]);

  // Tokenize and filter
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopwords.has(word));

  // Count word frequency
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  // Sort by frequency and return top N
  return [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([word]) => word);
}
