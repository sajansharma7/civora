import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(2, 'Comment cannot be empty'),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params;
    const session = await auth();

    let userId = session?.user?.id;
    let isOfficial = false;

    if (session?.user) {
      isOfficial = session.user.role === 'ORG_STAFF' || session.user.role === 'ORG_ADMIN';
    } else {
      const demoUser = await prisma.user.findFirst({ where: { role: 'CITIZEN' } });
      userId = demoUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const result = commentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid comment' },
        { status: 400 }
      );
    }

    const comment = await prisma.issueComment.create({
      data: {
        issueId,
        userId,
        content: result.data.content,
        isOfficialUpdate: isOfficial,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    // Notify reporter if comment is from someone else
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (issue && issue.reporterId !== userId) {
      await createNotification(
        issue.reporterId,
        'NEW_COMMENT',
        isOfficial ? 'Official Municipal Update' : 'New Comment on Your Report',
        result.data.content.slice(0, 100),
        issueId,
        `/issues/${issueId}`
      );
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
