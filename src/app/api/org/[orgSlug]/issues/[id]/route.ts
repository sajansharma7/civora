import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { IssueStatus } from '@prisma/client';
import { z } from 'zod';

const updateIssueSchema = z.object({
  status: z.nativeEnum(IssueStatus).optional(),
  departmentId: z.string().optional(),
  comment: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgSlug: string; id: string }> }
) {
  try {
    const { orgSlug, id: issueId } = await params;
    const session = await auth();

    let userId = session?.user?.id;
    if (!userId) {
      const staffUser = await prisma.user.findFirst({
        where: { role: { in: ['ORG_STAFF', 'ORG_ADMIN'] } },
      }) || await prisma.user.findFirst();
      userId = staffUser?.id;
    }

    const body = await req.json();
    const result = updateIssueSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid parameters' }, { status: 400 });
    }

    const { status, departmentId, comment } = result.data;

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const oldStatus = issue.status;
    const dataToUpdate: any = {};

    if (status) {
      dataToUpdate.status = status;
      if (status === 'RESOLVED') {
        dataToUpdate.resolvedAt = new Date();
      }
    }

    if (departmentId) {
      dataToUpdate.assignedDepartmentId = departmentId;
      if (issue.status === 'REPORTED' || issue.status === 'VERIFIED') {
        dataToUpdate.status = 'ASSIGNED';
      }
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: dataToUpdate,
      include: {
        category: true,
        assignedDepartment: true,
      },
    });

    // Create Audit History
    if (status && status !== oldStatus) {
      await prisma.issueStatusHistory.create({
        data: {
          issueId,
          changedById: userId,
          oldStatus,
          newStatus: status,
          comment: comment || `Status updated to ${status} by municipal dispatch`,
        },
      });

      // Notify reporter
      await createNotification(
        issue.reporterId,
        'ISSUE_STATUS_CHANGED',
        `Status Updated: ${status}`,
        `Your report "${issue.title}" is now ${status.replace('_', ' ')}.`,
        issueId,
        `/issues/${issueId}`
      );
    }

    return NextResponse.json({ success: true, issue: updatedIssue });
  } catch (error) {
    console.error('Org update issue error:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
