// ============================================================
// TypeScript Type Definitions
// ============================================================
// These define the SHAPE of data in our application.
// Think of types as "contracts" - they tell TypeScript
// what properties an object should have.
//
// For example, if you define a type with { name: string },
// TypeScript will warn you if you try to use it without
// the 'name' property, preventing bugs before they happen.
// ============================================================

// ---- Issue-related types ----

// How an issue appears in list views and cards
export interface IssueCardData {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  priorityScore: number;
  priorityLevel: string;
  communityConfidence: number;
  confirmationsCount: number;
  disputesCount: number;
  followersCount: number;
  isEmergency: boolean;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  ward: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    colorCode: string;
  };
  reporter: {
    id: string;
    name: string;
    avatar: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;
  assignedOrg?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  assignedDepartment?: {
    id: string;
    name: string;
  } | null;
}

// Full issue details (for the /issues/[id] page)
export interface IssueDetailData extends IssueCardData {
  safetyRisk: string;
  affectedPeopleEst: number;
  priorityExplanation: string | null;
  province: string | null;
  district: string | null;
  country: string;
  potentialDuplicateOfId: string | null;
  needsReverification: boolean;
  resolvedAt: string | null;
  updatedAt: string;
  confirmations: Array<{
    id: string;
    userId: string;
    comment: string | null;
    evidenceImage: string | null;
    createdAt: string;
    user: { name: string; avatar: string | null };
  }>;
  disputes: Array<{
    id: string;
    userId: string;
    reason: string;
    details: string;
    createdAt: string;
    user: { name: string; avatar: string | null };
  }>;
  comments: Array<{
    id: string;
    content: string;
    isOfficialUpdate: boolean;
    createdAt: string;
    user: { id: string; name: string; avatar: string | null; role: string };
  }>;
  statusHistory: Array<{
    id: string;
    oldStatus: string;
    newStatus: string;
    comment: string | null;
    createdAt: string;
    changedBy: { name: string; avatar: string | null } | null;
  }>;
  resolutionEvidence: {
    id: string;
    afterImageUrl: string;
    description: string;
    completionDate: string;
    fixedVotes: number;
    partiallyFixedVotes: number;
    stillExistsVotes: number;
  } | null;
}

// Data needed to create a new issue (from the report wizard)
export interface CreateIssueInput {
  title: string;
  description: string;
  categoryId: string;
  severity: string;
  safetyRisk: string;
  affectedPeopleEst: number;
  isEmergency: boolean;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  ward?: string;
  province?: string;
  district?: string;
}

// ---- User-related types ----

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
  profile: {
    bio: string | null;
    city: string | null;
    ward: string | null;
    reportsCount: number;
    resolvedCount: number;
  } | null;
  reputation: {
    points: number;
    level: string;
    helpfulVotes: number;
  } | null;
}

// ---- Organization-related types ----

export interface OrgDashboardData {
  organization: {
    id: string;
    name: string;
    slug: string;
    orgType: string;
    city: string | null;
    logo: string | null;
  };
  metrics: {
    totalIssues: number;
    criticalIssues: number;
    avgResolutionDays: number;
    citizenSatisfaction: number;
    resolvedThisMonth: number;
    newThisWeek: number;
  };
  issuesByCategory: Array<{ name: string; count: number; color: string }>;
  issuesByStatus: Array<{ status: string; count: number }>;
  monthlyTrend: Array<{ month: string; reported: number; resolved: number }>;
}

// ---- Analytics types ----

export interface PublicAnalyticsData {
  totalIssues: number;
  totalResolved: number;
  resolutionRate: number;
  avgResolutionDays: number;
  activeWards: number;
  verifiedPercentage: number;
  issuesByCategory: Array<{ name: string; count: number; color: string }>;
  issuesByCity: Array<{ city: string; count: number; resolved: number }>;
  monthlyTrend: Array<{ month: string; reported: number; resolved: number }>;
  topWards: Array<{ ward: string; city: string; issues: number; resolved: number }>;
}

// ---- Duplicate Detection types ----

export interface DuplicateCandidate {
  issueId: string;
  trackingCode: string;
  title: string;
  compositeScore: number;
  distanceMeters: number;
  confirmationsCount: number;
}

// ---- Notification types ----

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  issue?: {
    id: string;
    trackingCode: string;
    title: string;
  } | null;
}

// ---- API Response wrapper ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---- Map types ----

export interface MapIssue {
  id: string;
  trackingCode: string;
  title: string;
  latitude: number;
  longitude: number;
  status: string;
  priorityLevel: string;
  priorityScore: number;
  confirmationsCount: number;
  communityConfidence: number;
  category: {
    name: string;
    icon: string;
    colorCode: string;
  };
  images: Array<{ url: string }>;
}
