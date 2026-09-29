import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findPotentialDuplicates } from '@/lib/algorithms/duplicateDetector';
import { z } from 'zod';

const duplicateCheckSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  categoryId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  threshold: z.number().optional().default(0.55),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = duplicateCheckSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const { title, description, categoryId, latitude, longitude } = result.data;

    // Fetch existing open and un-resolved issues to compare against
    const existingIssues = await prisma.issue.findMany({
      where: {
        status: {
          notIn: ['RESOLVED', 'REJECTED'],
        },
      },
      select: {
        id: true,
        trackingCode: true,
        title: true,
        description: true,
        categoryId: true,
        latitude: true,
        longitude: true,
        status: true,
        priorityScore: true,
        communityConfidence: true,
        confirmationsCount: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            colorCode: true,
          },
        },
        images: {
          take: 1,
          select: { url: true },
        },
      },
    });

    // Format for duplicate detector algorithm
    const candidates = existingIssues.map((issue) => ({
      id: issue.id,
      trackingCode: issue.trackingCode,
      title: issue.title,
      description: issue.description,
      categoryId: issue.categoryId,
      lat: Number(issue.latitude),
      lng: Number(issue.longitude),
      confirmationsCount: issue.confirmationsCount,
    }));

    // Run Haversine + TF-IDF similarity evaluation
    const matches = findPotentialDuplicates(
      {
        title,
        description,
        categoryId,
        lat: latitude,
        lng: longitude,
      },
      candidates
    );

    return NextResponse.json({
      success: true,
      hasPotentialDuplicate: matches.length > 0,
      matches,
      matchCount: matches.length,
    });
  } catch (error) {
    console.error('Duplicate detection API error:', error);
    return NextResponse.json(
      { error: 'Failed to run duplicate detection' },
      { status: 500 }
    );
  }
}
