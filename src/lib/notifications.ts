// ============================================================
// Notification Dispatcher
// ============================================================
// Creates in-app notifications when important things happen.
// For example, when someone confirms your reported issue,
// or when the municipality updates the status of an issue you follow.
// ============================================================

import { prisma } from './prisma';

// All possible notification types
export type NotificationType =
  | 'ISSUE_CONFIRMED'        // Someone confirmed your issue
  | 'ISSUE_DISPUTED'         // Someone disputed your issue
  | 'ISSUE_STATUS_CHANGED'   // Status was updated (e.g., "In Progress")
  | 'ISSUE_ASSIGNED'         // Issue was assigned to an organization
  | 'ISSUE_RESOLVED'         // Issue was marked as resolved
  | 'RESOLUTION_VOTE_REQUEST' // "Has this issue been fixed?" vote request
  | 'ISSUE_REOPENED'         // A resolved issue was reopened
  | 'NEW_COMMENT'            // Someone commented on your issue
  | 'FOLLOWER_UPDATE';       // Update for followers of an issue

/**
 * createNotification - Send a notification to one user
 *
 * @param userId - Who receives the notification
 * @param type - What kind of notification (see types above)
 * @param title - Short headline
 * @param message - Detailed message
 * @param issueId - Related issue (optional)
 * @param actionUrl - URL to navigate to when clicked (optional)
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  issueId?: string,
  actionUrl?: string
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        issueId: issueId || null,
        actionUrl: actionUrl || null,
      },
    });
  } catch (error) {
    // Log but don't crash - notifications are not critical
    console.error('Failed to create notification:', error);
  }
}

/**
 * notifyIssueFollowers - Send notifications to everyone following an issue
 *
 * When something happens to an issue (status change, resolution, etc.),
 * all users who clicked "Follow" on that issue get notified.
 *
 * @param issueId - The issue that had something happen
 * @param type - What kind of event happened
 * @param title - Notification headline
 * @param message - Notification body
 * @param excludeUserId - Don't notify this user (usually the person who caused the event)
 */
export async function notifyIssueFollowers(
  issueId: string,
  type: NotificationType,
  title: string,
  message: string,
  excludeUserId?: string
): Promise<void> {
  try {
    // Find all followers of this issue
    const followers = await prisma.issueFollow.findMany({
      where: { issueId },
      select: { userId: true },
    });

    // Also notify the original reporter
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { reporterId: true, trackingCode: true },
    });

    // Collect unique user IDs (followers + reporter)
    const userIds = new Set<string>();
    followers.forEach((f) => userIds.add(f.userId));
    if (issue?.reporterId) userIds.add(issue.reporterId);

    // Remove the person who triggered the event (they already know)
    if (excludeUserId) userIds.delete(excludeUserId);

    const actionUrl = `/issues/${issueId}`;

    // Create notification for each user
    const notificationData = [...userIds].map((userId) => ({
      userId,
      type,
      title,
      message,
      issueId,
      actionUrl,
    }));

    // Bulk insert for efficiency
    if (notificationData.length > 0) {
      await prisma.notification.createMany({
        data: notificationData,
      });
    }
  } catch (error) {
    console.error('Failed to notify followers:', error);
  }
}

/**
 * notifyOrgStaff - Send notification to all staff of an organization
 *
 * Used when a new issue is assigned to their organization.
 */
export async function notifyOrgStaff(
  orgId: string,
  type: NotificationType,
  title: string,
  message: string,
  issueId?: string
): Promise<void> {
  try {
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      select: { userId: true },
    });

    const actionUrl = issueId ? `/issues/${issueId}` : undefined;

    const notificationData = members.map((m) => ({
      userId: m.userId,
      type,
      title,
      message,
      issueId: issueId || null,
      actionUrl: actionUrl || null,
    }));

    if (notificationData.length > 0) {
      await prisma.notification.createMany({
        data: notificationData,
      });
    }
  } catch (error) {
    console.error('Failed to notify org staff:', error);
  }
}
