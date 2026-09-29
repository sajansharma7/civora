import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { title = '', description = '' } = await req.json();
    const text = `${title} ${description}`.toLowerCase();

    if (text.trim().length < 5) {
      return NextResponse.json({ suggestedCategory: null });
    }

    const categories = await prisma.issueCategory.findMany();

    // Keyword mapping for civic issue domains matching database slugs
    const keywordMap: Record<string, string[]> = {
      'road-damage': ['pothole', 'road', 'asphalt', 'traffic', 'pavement', 'bridge', 'street', 'bus', 'sidewalk', 'lane', 'footpath', 'vehicle'],
      'waste-management': ['garbage', 'trash', 'waste', 'dump', 'bin', 'litter', 'smell', 'odor', 'sewage', 'debris', 'cleaning'],
      'water-supply': ['water', 'pipe', 'leak', 'pipeline', 'tap', 'contamination', 'drinking water', 'supply', 'burst', 'dry'],
      'drainage-sewage': ['flood', 'drain', 'waterlog', 'culvert', 'gutter', 'overflow', 'clogged', 'monsoon', 'submerged'],
      'street-lighting': ['streetlight', 'light', 'lamp', 'dark', 'electric', 'wire', 'pole', 'transformer', 'blackout', 'cable', 'hanging wire'],
      'public-safety': ['crime', 'theft', 'danger', 'cctv', 'harassment', 'unsafe', 'police', 'security', 'guard', 'vandalism'],
      'environmental-hazard': ['landslide', 'tree', 'fallen', 'hazard', 'pollution', 'smoke', 'river', 'erosion', 'sinkhole', 'fire'],
      'public-infrastructure': ['park', 'bench', 'playground', 'public toilet', 'building', 'wall', 'signboard', 'market', 'hospital'],
    };

    let bestCategory = null;
    let highestScore = 0;

    for (const cat of categories) {
      const keywords = keywordMap[cat.slug] || [];
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) {
          score += 1;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestCategory = cat;
      }
    }

    return NextResponse.json({
      suggestedCategory: highestScore > 0 ? bestCategory : null,
      confidence: highestScore > 1 ? 'HIGH' : highestScore === 1 ? 'MEDIUM' : 'LOW',
    });
  } catch (error) {
    console.error('Suggest category error:', error);
    return NextResponse.json({ suggestedCategory: null });
  }
}
