import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculatePriority } from '@/lib/algorithms/priorityEngine';
import { calculateCommunityConfidence } from '@/lib/algorithms/communityConfidence';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';
import { Severity, SafetyRisk, IssueStatus, PriorityLevel } from '@prisma/client';

const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  severity: z.nativeEnum(Severity).default(Severity.MEDIUM),
  safetyRisk: z.nativeEnum(SafetyRisk).default(SafetyRisk.LOW),
  affectedPeopleEst: z.number().int().min(1).default(50),
  isEmergency: z.boolean().default(false),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(2, 'Address is required'),
  city: z.string().default('Pokhara'),
  ward: z.string().optional(),
  images: z.array(z.string()).default([]),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const city = searchParams.get('city');
    const ward = searchParams.get('ward');
    const isEmergency = searchParams.get('emergency');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'priority';
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 30));
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    // Geospatial viewport bounding box
    const minLat = searchParams.get('minLat');
    const maxLat = searchParams.get('maxLat');
    const minLng = searchParams.get('minLng');
    const maxLng = searchParams.get('maxLng');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as IssueStatus;
    }

    if (category && category !== 'ALL') {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    if (severity && severity !== 'ALL') {
      where.severity = severity as Severity;
    }

    if (city && city !== 'ALL') {
      where.city = { contains: city };
    }

    if (ward && ward !== 'ALL') {
      where.ward = ward;
    }

    if (isEmergency === 'true') {
      where.isEmergency = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { trackingCode: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (minLat && maxLat && minLng && maxLng) {
      where.latitude = {
        gte: Number(minLat),
        lte: Number(maxLat),
      };
      where.longitude = {
        gte: Number(minLng),
        lte: Number(maxLng),
      };
    }

    // Determine sorting order
    let orderBy: any = { priorityScore: 'desc' };
    if (sort === 'recent') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'confirmations') {
      orderBy = { confirmationsCount: 'desc' };
    } else if (sort === 'confidence') {
      orderBy = { communityConfidence: 'desc' };
    }

    const [total, issues] = await Promise.all([
      prisma.issue.count({ where }),
      prisma.issue.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          reporter: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          images: true,
          assignedOrg: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              confirmations: true,
              disputes: true,
              follows: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    // Format Decimal coordinates to float
    const formattedIssues = issues.map((issue) => ({
      ...issue,
      latitude: Number(issue.latitude),
      longitude: Number(issue.longitude),
      confirmationsCount: issue._count.confirmations,
      disputesCount: issue._count.disputes,
      followersCount: issue._count.follows,
      commentsCount: issue._count.comments,
    }));

    return NextResponse.json({
      issues: formattedIssues,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error querying issues:', error);
    return NextResponse.json({ error: 'Failed to retrieve issues' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    let reporterId = session?.user?.id;

    // If not authenticated, link to a default citizen for seamless demo experience
    if (!reporterId) {
      const demoCitizen = await prisma.user.findFirst({
        where: { role: 'CITIZEN' },
      });
      reporterId = demoCitizen?.id;
      if (!reporterId) {
        return NextResponse.json(
          { error: 'Authentication required to report issues' },
          { status: 401 }
        );
      }
    }

    const body = await req.json();
    const result = createIssueSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const data = result.data;

    // Generate unique sequential tracking code (e.g., CIV-1045)
    const count = await prisma.issue.count();
    const trackingCode = `CIV-${1000 + count + 1}`;

    // Deterministic Priority Engine computation
    const priorityCalc = calculatePriority({
      severity: data.severity,
      confirmationsCount: 0,
      safetyRisk: data.safetyRisk,
      affectedPeopleEst: data.affectedPeopleEst,
      createdAt: new Date(),
      followersCount: 0,
      isEmergency: data.isEmergency,
    });

    // Dynamic Community Confidence score
    const initialConfidence = calculateCommunityConfidence(0, 0, data.images.length > 0);

    // Auto-assign to nearest municipality based on city
    const assignedOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { city: { contains: data.city } },
          { name: { contains: data.city } },
        ],
      },
    }) || await prisma.organization.findFirst();

    // Create the Issue in Prisma
    const issue = await prisma.issue.create({
      data: {
        trackingCode,
        title: data.title,
        description: data.description,
        category: { connect: { id: data.categoryId } },
        reporter: { connect: { id: reporterId } },
        severity: data.severity,
        safetyRisk: data.safetyRisk,
        affectedPeopleEst: data.affectedPeopleEst,
        isEmergency: data.isEmergency,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        city: data.city,
        ward: data.ward || null,
        status: IssueStatus.REPORTED,
        priorityScore: priorityCalc.score,
        priorityLevel: priorityCalc.level as PriorityLevel,
        priorityExplanation: priorityCalc.explanation,
        communityConfidence: initialConfidence,
        ...(assignedOrg?.id && {
          assignedOrg: { connect: { id: assignedOrg.id } },
        }),
        images: {
          create: data.images.map((url) => ({
            url,
          })),
        },
        statusHistory: {
          create: {
            changedById: reporterId,
            oldStatus: IssueStatus.REPORTED,
            newStatus: IssueStatus.REPORTED,
            comment: 'Issue submitted via citizen reporting wizard',
          },
        },
      },
      include: {
        category: true,
        images: true,
        assignedOrg: true,
      },
    });

    // Award +5 reputation points and increment reports count
    try {
      await prisma.$transaction([
        prisma.profile.updateMany({
          where: { userId: reporterId },
          data: { reportsCount: { increment: 1 } },
        }),
        prisma.reputation.updateMany({
          where: { userId: reporterId },
          data: { points: { increment: 5 } },
        }),
      ]);
    } catch (repError) {
      console.warn('Could not update reputation points:', repError);
    }

    // Send confirmation notification to citizen
    await createNotification(
      reporterId,
      'ISSUE_STATUS_CHANGED',
      `Issue ${trackingCode} Logged Successfully`,
      `Your report "${data.title}" has been registered and queued for verification.`,
      issue.id,
      `/issues/${issue.id}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Issue reported successfully',
        issue: {
          ...issue,
          latitude: Number(issue.latitude),
          longitude: Number(issue.longitude),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { error: 'Internal server error while reporting issue' },
      { status: 500 }
    );
  }
}
