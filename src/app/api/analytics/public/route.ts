import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'Pokhara';

    const whereCity = {
      city: { contains: city },
    };

    const [
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      verifiedIssues,
      totalConfirmations,
    ] = await Promise.all([
      prisma.issue.count({ where: whereCity }),
      prisma.issue.count({ where: { ...whereCity, status: 'RESOLVED' } }),
      prisma.issue.count({ where: { ...whereCity, status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { ...whereCity, status: 'VERIFIED' } }),
      prisma.issueConfirmation.count(),
    ]);

    // Categories Breakdown
    const categories = await prisma.issueCategory.findMany();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.issue.count({
          where: {
            ...whereCity,
            categoryId: cat.id,
          },
        });
        const resolved = await prisma.issue.count({
          where: {
            ...whereCity,
            categoryId: cat.id,
            status: 'RESOLVED',
          },
        });
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          color: cat.colorCode,
          count,
          resolved,
          rate: count > 0 ? Math.round((resolved / count) * 100) : 0,
        };
      })
    );

    // Ward Leaderboard Analytics
    const sampleWards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 6', 'Ward 8', 'Ward 9', 'Ward 17'];
    const wardStats = await Promise.all(
      sampleWards.map(async (ward) => {
        const total = await prisma.issue.count({
          where: {
            ...whereCity,
            ward,
          },
        });
        const resolved = await prisma.issue.count({
          where: {
            ...whereCity,
            ward,
            status: 'RESOLVED',
          },
        });
        return {
          ward,
          total,
          resolved,
          rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        };
      })
    );

    // Monthly resolution activity mock / historical data
    const monthlyTrends = [
      { month: 'Apr', reported: 18, resolved: 14 },
      { month: 'May', reported: 24, resolved: 19 },
      { month: 'Jun', reported: 32, resolved: 26 },
      { month: 'Jul', reported: 45, resolved: 38 },
      { month: 'Aug', reported: 52, resolved: 44 },
      { month: 'Sep', reported: totalIssues, resolved: resolvedIssues },
    ];

    return NextResponse.json({
      city,
      summary: {
        totalIssues,
        resolvedIssues,
        inProgressIssues,
        verifiedIssues,
        totalConfirmations,
        resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0,
        avgResolutionDays: 4.8,
        activeCitizens: 30,
      },
      categoryStats: categoryStats.filter((c) => c.count > 0),
      wardLeaderboard: wardStats.sort((a, b) => b.rate - a.rate),
      monthlyTrends,
    });
  } catch (error) {
    console.error('Transparency API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve civic metrics' }, { status: 500 });
  }
}
