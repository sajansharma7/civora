import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CitizenProfileClient from './CitizenProfileClient';

export const metadata = {
  title: 'Citizen Profile & Civic Reputation',
  description: 'Track your civic contributions, reputation points, badges, and reported issues.',
};

export default async function CitizenProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/citizen/profile');
  }

  // Fetch full user record with relations
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
    redirect('/login');
  }

  // Format dates for client component
  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    profile: user.profile ? {
      ...user.profile,
      latitude: user.profile.latitude ? Number(user.profile.latitude) : null,
      longitude: user.profile.longitude ? Number(user.profile.longitude) : null,
      updatedAt: user.profile.updatedAt.toISOString(),
    } : null,
    reputation: user.reputation ? {
      ...user.reputation,
      updatedAt: user.reputation.updatedAt.toISOString(),
    } : null,
    reportedIssues: user.reportedIssues.map((issue) => ({
      ...issue,
      latitude: Number(issue.latitude),
      longitude: Number(issue.longitude),
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      confirmationsCount: issue.confirmations.length,
    })),
    follows: user.follows.map((follow) => ({
      ...follow,
      createdAt: follow.createdAt.toISOString(),
      issue: {
        ...follow.issue,
        latitude: Number(follow.issue.latitude),
        longitude: Number(follow.issue.longitude),
        createdAt: follow.issue.createdAt.toISOString(),
        updatedAt: follow.issue.updatedAt.toISOString(),
      },
    })),
  };

  return <CitizenProfileClient initialUser={serializedUser as any} />;
}
