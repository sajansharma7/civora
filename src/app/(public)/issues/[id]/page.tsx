import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import IssueDetailClient from './IssueDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await prisma.issue.findUnique({
    where: { id },
    select: { title: true, trackingCode: true, description: true },
  });

  if (!issue) return { title: 'Issue Not Found' };

  return {
    title: `${issue.trackingCode}: ${issue.title}`,
    description: issue.description.slice(0, 160),
  };
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      category: true,
      reporter: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          reputation: true,
        },
      },
      assignedOrg: true,
      assignedDepartment: true,
      images: true,
      confirmations: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      disputes: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      follows: true,
      statusHistory: {
        include: {
          changedBy: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      resolutionEvidence: {
        include: {
          votes: true,
        },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, role: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!issue) {
    notFound();
  }

  // Format serializable fields for client
  const serializedIssue = {
    ...issue,
    latitude: Number(issue.latitude),
    longitude: Number(issue.longitude),
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
    resolvedAt: issue.resolvedAt ? issue.resolvedAt.toISOString() : null,
    statusHistory: issue.statusHistory.map((sh) => ({
      ...sh,
      createdAt: sh.createdAt.toISOString(),
    })),
    confirmations: issue.confirmations.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
    disputes: issue.disputes.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
    comments: issue.comments.map((cm) => ({
      ...cm,
      createdAt: cm.createdAt.toISOString(),
    })),
    resolutionEvidence: issue.resolutionEvidence
      ? {
          ...issue.resolutionEvidence,
          completionDate: issue.resolutionEvidence.completionDate.toISOString(),
          createdAt: issue.resolutionEvidence.createdAt.toISOString(),
          votes: issue.resolutionEvidence.votes.map((v) => ({
            ...v,
            createdAt: v.createdAt.toISOString(),
          })),
        }
      : null,
  };

  return <IssueDetailClient initialIssue={serializedIssue as any} />;
}
