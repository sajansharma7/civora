import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  ward: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        reputation: true,
        reportedIssues: {
          include: {
            category: true,
            images: true,
            confirmations: { select: { id: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        follows: {
          include: {
            issue: {
              include: {
                category: true,
                images: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching citizen profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input data' }, { status: 400 });
    }

    const { name, bio, city, ward, phoneNumber } = result.data;

    // Update user display name and phone if provided
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
      },
    });

    // Upsert user profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio: bio || '',
        city: city || 'Pokhara',
        ward: ward || null,
      },
      update: {
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(ward !== undefined && { ward }),
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating citizen profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
