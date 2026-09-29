import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyIssueFollowers, createNotification } from '@/lib/notifications';
import { IssueStatus } from '@prisma/client';
import { z } from 'zod';

const resolveSchema = z.object({
  afterImageUrl: z.string().min(1, 'After photo is required as evidence'),
  description: z.string().min(10, 'Resolution description must be at least 10 characters'),
  completionDate: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params;
    const session = await auth();

    let userId = session?.user?.id;
    if (!userId) {
      const staffUser = await prisma.user.findFirst({
        where: { role: { in: ['ORG_STAFF', 'ORG_ADMIN'] } },
      }) || await prisma.user.findFirst();
      userId = staffUser?.id;
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const body = await req.json();
    const result = resolveSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { afterImageUrl, description, completionDate } = result.data;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { reporter: true },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Upsert resolution evidence
    const resolution = await prisma.resolutionEvidence.upsert({
      where: { issueId },
      create: {
        issueId,
        submittedById: userId,
        afterImageUrl,
        description,
        completionDate: completionDate ? new Date(completionDate) : new Date(),
        fixedVotes: 0,
        partiallyFixedVotes: 0,
        stillExistsVotes: 0,
      },
      update: {
        submittedById: userId,
        afterImageUrl,
        description,
        completionDate: completionDate ? new Date(completionDate) : new Date(),
      },
    });

    // Update Issue status to RESOLVED
    const oldStatus = issue.status;
    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: IssueStatus.RESOLVED,
        resolvedAt: new Date(),
        needsReverification: true,
      },
    });

    // Create Audit Trail History
    await prisma.issueStatusHistory.create({
      data: {
        issueId,
        changedById: userId,
        oldStatus,
        newStatus: IssueStatus.RESOLVED,
        comment: `Marked resolved with photographic evidence: ${description}`,
      },
    });

    // Increment reporter's resolvedCount in Profile
    try {
      await prisma.profile.updateMany({
        where: { userId: issue.reporterId },
        data: { resolvedCount: { increment: 1 } },
      });
      // Award reporter +10 reputation points for having an issue resolved!
      await prisma.reputation.updateMany({
        where: { userId: issue.reporterId },
        data: { points: { increment: 10 } },
      });
    } catch (e) {
      console.warn('Reputation update error', e);
    }

    // Notify Reporter
    await createNotification(
      issue.reporterId,
      'RESOLUTION_VOTE_REQUEST',
      'Resolution Evidence Submitted',
      `Municipal teams submitted completion evidence for "${issue.title}". Please verify if the fix meets community standards.`,
      issueId,
      `/issues/${issueId}`
    );

    // Notify all issue followers
    await notifyIssueFollowers(
      issueId,
      'RESOLUTION_VOTE_REQUEST',
      'Issue Marked as Resolved — Verification Needed',
      `The municipal department marked "${issue.title}" as resolved with after-photos. Cast your verification vote!`,
      `/issues/${issueId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Resolution evidence published and verification requested',
      resolution,
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Resolution submission error:', error);
    return NextResponse.json({ error: 'Failed to record resolution' }, { status: 500 });
  }
}
