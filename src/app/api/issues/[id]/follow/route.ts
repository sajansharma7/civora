import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePriority } from '@/lib/algorithms/priorityEngine';
import { PriorityLevel } from '@prisma/client';

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
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check if currently following
    const existingFollow = await prisma.issueFollow.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    let isFollowing = false;
    let newFollowersCount = issue.followersCount;

    if (existingFollow) {
      // Unfollow
      await prisma.issueFollow.delete({
        where: {
          issueId_userId: {
            issueId,
            userId,
          },
        },
      });
      newFollowersCount = Math.max(0, issue.followersCount - 1);
      isFollowing = false;
    } else {
      // Follow
      await prisma.issueFollow.create({
        data: {
          issueId,
          userId,
        },
      });
      newFollowersCount = issue.followersCount + 1;
      isFollowing = true;
    }

    // Recalculate priority
    const priorityCalc = calculatePriority({
      severity: issue.severity,
      confirmationsCount: issue.confirmationsCount,
      safetyRisk: issue.safetyRisk,
      affectedPeopleEst: issue.affectedPeopleEst,
      createdAt: issue.createdAt,
      followersCount: newFollowersCount,
      isEmergency: issue.isEmergency,
    });

    await prisma.issue.update({
      where: { id: issueId },
      data: {
        followersCount: newFollowersCount,
        priorityScore: priorityCalc.score,
        priorityLevel: priorityCalc.level as PriorityLevel,
        priorityExplanation: priorityCalc.explanation,
      },
    });

    return NextResponse.json({
      success: true,
      isFollowing,
      followersCount: newFollowersCount,
      priorityScore: priorityCalc.score,
    });
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}
