import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params;

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: {
        departments: true,
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Issues count
    const [totalIssues, criticalIssues, resolvedIssues, inProgressIssues] = await Promise.all([
      prisma.issue.count({ where: { assignedOrgId: org.id } }),
      prisma.issue.count({
        where: {
          assignedOrgId: org.id,
          OR: [{ priorityScore: { gte: 80 } }, { isEmergency: true }],
        },
      }),
      prisma.issue.count({
        where: {
          assignedOrgId: org.id,
          status: 'RESOLVED',
        },
      }),
      prisma.issue.count({
        where: {
          assignedOrgId: org.id,
          status: 'IN_PROGRESS',
        },
      }),
    ]);

    // Category distribution
    const categories = await prisma.issueCategory.findMany();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.issue.count({
          where: {
            assignedOrgId: org.id,
            categoryId: cat.id,
          },
        });
        return {
          name: cat.name,
          count,
          color: cat.colorCode,
        };
      })
    );

    // Status breakdown
    const statuses = ['REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const statusStats = await Promise.all(
      statuses.map(async (st) => {
        const count = await prisma.issue.count({
          where: {
            assignedOrgId: org.id,
            status: st as any,
          },
        });
        return {
          name: st.replace('_', ' '),
          count,
        };
      })
    );

    // Recent critical/high priority issues
    const recentIssues = await prisma.issue.findMany({
      where: { assignedOrgId: org.id },
      orderBy: { priorityScore: 'desc' },
      take: 6,
      include: {
        category: true,
        assignedDepartment: true,
      },
    });

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        city: org.city,
        subscription: org.subscription || null,
        departmentsCount: org.departments.length,
      },
      kpis: {
        totalIssues,
        criticalIssues,
        resolvedIssues,
        inProgressIssues,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
      },
      categoryStats: categoryStats.filter((c) => c.count > 0),
      statusStats,
      recentIssues: recentIssues.map((i) => ({
        ...i,
        latitude: Number(i.latitude),
        longitude: Number(i.longitude),
      })),
    });
  } catch (error) {
    console.error('Org stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
