import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCommunityConfidence } from '@/lib/algorithms/communityConfidence';
import { calculatePriority } from '@/lib/algorithms/priorityEngine';
import { createNotification } from '@/lib/notifications';
import { IssueStatus, PriorityLevel } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params;
    const session = await auth();

    let userId = session?.user?.id;
    if (!userId) {
      // Fallback demo citizen if testing unauthenticated
      const demoUser = await prisma.user.findFirst({
        where: { email: 'aarav.sharma@gmail.com' },
      }) || await prisma.user.findFirst({ where: { role: 'CITIZEN' } });
      userId = demoUser?.id;
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        images: true,
        confirmations: true,
        disputes: true,
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check if user already confirmed
    const existingConfirmation = await prisma.issueConfirmation.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    if (existingConfirmation) {
      return NextResponse.json(
        { error: 'You have already confirmed this issue' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { comment, evidenceImage } = body;

    // Create confirmation
    await prisma.issueConfirmation.create({
      data: {
        issueId,
        userId,
        comment: comment || null,
        evidenceImage: evidenceImage || null,
      },
    });

    // Award confirming citizen +2 reputation points
    try {
      await prisma.reputation.updateMany({
        where: { userId },
        data: { points: { increment: 2 } },
      });
      // Award reporter +1 helpful vote
      await prisma.reputation.updateMany({
        where: { userId: issue.reporterId },
        data: {
          points: { increment: 1 },
          helpfulVotes: { increment: 1 },
        },
      });
    } catch (e) {
      console.warn('Reputation update error:', e);
    }

    // Recalculate metrics
    const newConfirmationsCount = issue.confirmations.length + 1;
    const newConfidence = calculateCommunityConfidence(
      newConfirmationsCount,
      issue.disputes.length,
      issue.images.length > 0 || !!evidenceImage
    );

    const priorityCalc = calculatePriority({
      severity: issue.severity,
      confirmationsCount: newConfirmationsCount,
      safetyRisk: issue.safetyRisk,
      affectedPeopleEst: issue.affectedPeopleEst,
      createdAt: issue.createdAt,
      followersCount: issue.followersCount,
      isEmergency: issue.isEmergency,
    });

    // Check if status should be promoted to VERIFIED (3+ confirmations)
    let newStatus = issue.status;
    if (issue.status === IssueStatus.REPORTED && newConfirmationsCount >= 3) {
      newStatus = IssueStatus.VERIFIED;

      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          changedById: userId,
          oldStatus: IssueStatus.REPORTED,
          newStatus: IssueStatus.VERIFIED,
          comment: `Automatically verified by community consensus (${newConfirmationsCount} confirmations)`,
        },
      });

      // Notify reporter that issue was verified
      await createNotification(
        issue.reporterId,
        'ISSUE_CONFIRMED',
        'Issue Verified by Community',
        `Your report "${issue.title}" reached community consensus and is now marked as VERIFIED!`,
        issueId,
        `/issues/${issueId}`
      );
    }

    // Update issue record
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        confirmationsCount: newConfirmationsCount,
        communityConfidence: newConfidence,
        priorityScore: priorityCalc.score,
        priorityLevel: priorityCalc.level as PriorityLevel,
        priorityExplanation: priorityCalc.explanation,
        status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Issue confirmed successfully',
      confirmationsCount: newConfirmationsCount,
      communityConfidence: newConfidence,
      priorityScore: priorityCalc.score,
      status: newStatus,
    });
  } catch (error) {
    console.error('Error confirming issue:', error);
    return NextResponse.json({ error: 'Failed to confirm issue' }, { status: 500 });
  }
}
