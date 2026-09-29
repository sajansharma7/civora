import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateCommunityConfidence } from '@/lib/algorithms/communityConfidence';
import { DisputeReason, IssueStatus } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params;
    const session = await auth();

    let userId = session?.user?.id;
    if (!userId) {
      const demoUser = await prisma.user.findFirst({ where: { role: 'CITIZEN' } });
      userId = demoUser?.id;
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        confirmations: true,
        disputes: true,
        images: true,
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check if user already disputed
    const existingDispute = await prisma.issueDispute.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    if (existingDispute) {
      return NextResponse.json(
        { error: 'You have already filed a dispute for this issue' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { reason = 'OTHER', details = '', evidenceImage } = body;

    // Create dispute record
    await prisma.issueDispute.create({
      data: {
        issueId,
        userId,
        reason: (reason as DisputeReason) || DisputeReason.OTHER,
        details,
        evidenceImage: evidenceImage || null,
      },
    });

    const newDisputesCount = issue.disputes.length + 1;
    const newConfidence = calculateCommunityConfidence(
      issue.confirmations.length,
      newDisputesCount,
      issue.images.length > 0
    );

    // If disputes heavily outweigh confirmations (3+ disputes and disputes > confirmations), mark for review
    let newStatus = issue.status;
    if (newDisputesCount >= 3 && newDisputesCount > issue.confirmations.length) {
      newStatus = IssueStatus.UNDER_REVIEW;
      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          changedById: userId,
          oldStatus: issue.status,
          newStatus: IssueStatus.UNDER_REVIEW,
          comment: `Flagged for municipal investigation due to multiple community disputes (${newDisputesCount} disputes)`,
        },
      });
    }

    await prisma.issue.update({
      where: { id: issueId },
      data: {
        disputesCount: newDisputesCount,
        communityConfidence: newConfidence,
        status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dispute submitted for municipal review',
      disputesCount: newDisputesCount,
      communityConfidence: newConfidence,
      status: newStatus,
    });
  } catch (error) {
    console.error('Error submitting dispute:', error);
    return NextResponse.json({ error: 'Failed to submit dispute' }, { status: 500 });
  }
}
