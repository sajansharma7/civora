import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { ResolutionVerdict, IssueStatus } from '@prisma/client';
import { z } from 'zod';

const voteSchema = z.object({
  verdict: z.nativeEnum(ResolutionVerdict),
  comment: z.string().optional(),
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
      const demoUser = await prisma.user.findFirst({ where: { role: 'CITIZEN' } });
      userId = demoUser?.id;
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const body = await req.json();
    const result = voteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid verdict' },
        { status: 400 }
      );
    }

    const { verdict, comment } = result.data;

    const resolution = await prisma.resolutionEvidence.findUnique({
      where: { issueId },
    });

    if (!resolution) {
      return NextResponse.json(
        { error: 'No resolution evidence found for this issue' },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.resolutionVerificationVote.findUnique({
      where: {
        resolutionId_userId: {
          resolutionId: resolution.id,
          userId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this resolution' },
        { status: 400 }
      );
    }

    // Record vote
    await prisma.resolutionVerificationVote.create({
      data: {
        resolutionId: resolution.id,
        userId,
        verdict,
        comment: comment || null,
      },
    });

    // Update vote count on ResolutionEvidence
    const voteUpdate =
      verdict === ResolutionVerdict.FIXED
        ? { fixedVotes: { increment: 1 } }
        : verdict === ResolutionVerdict.PARTIALLY_FIXED
        ? { partiallyFixedVotes: { increment: 1 } }
        : { stillExistsVotes: { increment: 1 } };

    const updatedResolution = await prisma.resolutionEvidence.update({
      where: { id: resolution.id },
      data: voteUpdate,
    });

    // Check if Still Exists votes require reopening
    let reopened = false;
    if (
      updatedResolution.stillExistsVotes >= 3 &&
      updatedResolution.stillExistsVotes > updatedResolution.fixedVotes
    ) {
      reopened = true;

      await prisma.issue.update({
        where: { id: issueId },
        data: {
          status: IssueStatus.REOPENED,
          needsReverification: false,
        },
      });

      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          changedById: userId,
          oldStatus: IssueStatus.RESOLVED,
          newStatus: IssueStatus.REOPENED,
          comment: `Issue reopened: Community verification failed with ${updatedResolution.stillExistsVotes} citizens reporting problem still exists`,
        },
      });

      // Send alert notification
      const issue = await prisma.issue.findUnique({ where: { id: issueId } });
      if (issue?.reporterId) {
        await createNotification(
          issue.reporterId,
          'ISSUE_REOPENED',
          'Issue Reopened for Incomplete Fix',
          `Community voters reported that "${issue.title}" still exists. The issue has been reopened for the municipality.`,
          issueId,
          `/issues/${issueId}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification vote recorded successfully',
      resolution: updatedResolution,
      reopened,
    });
  } catch (error) {
    console.error('Error verifying resolution:', error);
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
