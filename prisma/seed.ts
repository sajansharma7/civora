// ============================================================
// Database Seed Script
// ============================================================
// This script fills the database with realistic demo data.
// Run it with: npx prisma db seed
//
// It creates:
// - 3 subscription plans
// - 8 issue categories
// - 3 organizations with departments
// - 30+ users (admins, staff, citizens)
// - 50+ realistic issues across Pokhara and Kathmandu
// - Confirmations, disputes, comments, and status histories
// ============================================================

import { PrismaClient, Role, Severity, SafetyRisk, IssueStatus, ReputationLevel, OrgType, DisputeReason } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: Hash a password using bcrypt
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting Civora database seed...\n');

  // ============================================================
  // STEP 1: Create Subscription Plans
  // ============================================================
  console.log('📋 Creating subscription plans...');

  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'free' },
      update: {},
      create: {
        name: 'Free',
        slug: 'free',
        priceUsd: 0,
        maxDepts: 2,
        maxStaff: 5,
        hasAiFeatures: false,
        hasApiAccess: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'professional' },
      update: {},
      create: {
        name: 'Professional',
        slug: 'professional',
        priceUsd: 49.99,
        maxDepts: 10,
        maxStaff: 50,
        hasAiFeatures: true,
        hasApiAccess: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {},
      create: {
        name: 'Enterprise',
        slug: 'enterprise',
        priceUsd: 199.99,
        maxDepts: 50,
        maxStaff: 500,
        hasAiFeatures: true,
        hasApiAccess: true,
      },
    }),
  ]);
  console.log(`  ✅ Created ${plans.length} plans\n`);

  // ============================================================
  // STEP 2: Create Issue Categories
  // ============================================================
  console.log('🏷️  Creating issue categories...');

  const categoryData = [
    { name: 'Road Damage', slug: 'road-damage', icon: 'Construction', colorCode: '#ef4444', defaultSeverity: 'HIGH' as Severity, description: 'Potholes, cracks, road collapse, and pavement damage' },
    { name: 'Waste Management', slug: 'waste-management', icon: 'Trash2', colorCode: '#f97316', defaultSeverity: 'MEDIUM' as Severity, description: 'Garbage overflow, illegal dumping, missed collection' },
    { name: 'Water Supply', slug: 'water-supply', icon: 'Droplets', colorCode: '#3b82f6', defaultSeverity: 'HIGH' as Severity, description: 'Pipe leaks, water contamination, supply disruption' },
    { name: 'Drainage & Sewage', slug: 'drainage-sewage', icon: 'Waves', colorCode: '#8b5cf6', defaultSeverity: 'HIGH' as Severity, description: 'Blocked drains, sewage overflow, flooding' },
    { name: 'Street Lighting', slug: 'street-lighting', icon: 'Lightbulb', colorCode: '#eab308', defaultSeverity: 'MEDIUM' as Severity, description: 'Broken streetlights, dark areas, electrical hazards' },
    { name: 'Public Safety', slug: 'public-safety', icon: 'ShieldAlert', colorCode: '#dc2626', defaultSeverity: 'CRITICAL' as Severity, isEmergencyCategory: true, description: 'Safety hazards, structural risks, dangerous conditions' },
    { name: 'Environmental Hazard', slug: 'environmental-hazard', icon: 'TreePine', colorCode: '#16a34a', defaultSeverity: 'HIGH' as Severity, description: 'Pollution, deforestation, chemical spills' },
    { name: 'Public Infrastructure', slug: 'public-infrastructure', icon: 'Building2', colorCode: '#0ea5e9', defaultSeverity: 'MEDIUM' as Severity, description: 'Damaged bridges, public buildings, bus stops, parks' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.issueCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log(`  ✅ Created ${Object.keys(categories).length} categories\n`);

  // ============================================================
  // STEP 3: Create Organizations
  // ============================================================
  console.log('🏛️  Creating organizations...');

  const pokharaOrg = await prisma.organization.upsert({
    where: { slug: 'pokhara-metro' },
    update: {},
    create: {
      name: 'Pokhara Metropolitan City',
      slug: 'pokhara-metro',
      orgType: OrgType.MUNICIPALITY,
      description: 'Official municipal body for Pokhara Metropolitan City, Gandaki Province',
      email: 'info@pokharametro.gov.np',
      phone: '+977-61-520000',
      website: 'https://pokharametro.gov.np',
      country: 'Nepal',
      province: 'Gandaki',
      district: 'Kaski',
      city: 'Pokhara',
      latitude: 28.2096,
      longitude: 83.9856,
      coverageRadiusKm: 20.0,
    },
  });

  const ktmOrg = await prisma.organization.upsert({
    where: { slug: 'ktm-ward-4' },
    update: {},
    create: {
      name: 'Kathmandu Ward 4 Municipal Office',
      slug: 'ktm-ward-4',
      orgType: OrgType.WARD,
      description: 'Ward-level municipal office for Ward No. 4, Kathmandu Metropolitan City',
      email: 'ward4@kathmandu.gov.np',
      phone: '+977-1-4220000',
      country: 'Nepal',
      province: 'Bagmati',
      district: 'Kathmandu',
      city: 'Kathmandu',
      wardArea: 'Ward 4',
      latitude: 27.7172,
      longitude: 85.3240,
      coverageRadiusKm: 5.0,
    },
  });

  const ngoOrg = await prisma.organization.upsert({
    where: { slug: 'annapurna-action' },
    update: {},
    create: {
      name: 'Annapurna Conservation & Civic Action',
      slug: 'annapurna-action',
      orgType: OrgType.NGO,
      description: 'Community-driven NGO focused on environmental conservation and civic improvement in the Annapurna region',
      email: 'contact@annapurnaaction.org',
      website: 'https://annapurnaaction.org',
      country: 'Nepal',
      province: 'Gandaki',
      district: 'Kaski',
      city: 'Pokhara',
      latitude: 28.2200,
      longitude: 83.9900,
      coverageRadiusKm: 30.0,
    },
  });

  console.log(`  ✅ Created 3 organizations\n`);

  // ============================================================
  // STEP 4: Create Departments
  // ============================================================
  console.log('🏗️  Creating departments...');

  const depts: Record<string, string> = {};

  const deptData = [
    { orgId: pokharaOrg.id, name: 'Road Infrastructure', slug: 'road-infrastructure', description: 'Handles road construction, repair, and maintenance' },
    { orgId: pokharaOrg.id, name: 'Waste Management', slug: 'waste-management', description: 'Garbage collection, recycling, and waste disposal' },
    { orgId: pokharaOrg.id, name: 'Water & Drainage', slug: 'water-drainage', description: 'Water supply, drainage systems, and sewage' },
    { orgId: pokharaOrg.id, name: 'Electrical & Lighting', slug: 'electrical-lighting', description: 'Street lighting, electrical infrastructure' },
    { orgId: ktmOrg.id, name: 'General Services', slug: 'general-services', description: 'General ward-level services and maintenance' },
    { orgId: ktmOrg.id, name: 'Sanitation', slug: 'sanitation', description: 'Sanitation and cleanliness services' },
  ];

  for (const dept of deptData) {
    const created = await prisma.department.upsert({
      where: { organizationId_slug: { organizationId: dept.orgId, slug: dept.slug } },
      update: {},
      create: {
        organizationId: dept.orgId,
        name: dept.name,
        slug: dept.slug,
        description: dept.description,
      },
    });
    depts[dept.slug] = created.id;
  }
  console.log(`  ✅ Created ${Object.keys(depts).length} departments\n`);

  // ============================================================
  // STEP 5: Create Users
  // ============================================================
  console.log('👥 Creating users...');

  const hashedPassword = await hashPassword('Admin123!');
  const citizenPassword = await hashPassword('Citizen123!');

  // Platform Admin
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@civora.org' },
    update: {},
    create: {
      name: 'Civora Platform Admin',
      email: 'admin@civora.org',
      passwordHash: hashedPassword,
      role: Role.PLATFORM_ADMIN,
      isVerified: true,
    },
  });

  // Org Admin - Pokhara
  const pokharaAdmin = await prisma.user.upsert({
    where: { email: 'pokhara.admin@civora.org' },
    update: {},
    create: {
      name: 'Rajesh Gurung',
      email: 'pokhara.admin@civora.org',
      passwordHash: await hashPassword('Pokhara123!'),
      role: Role.ORG_ADMIN,
      isVerified: true,
      phoneNumber: '+977-9801234567',
    },
  });

  // Org Staff
  const roadsStaff = await prisma.user.upsert({
    where: { email: 'roads.staff@civora.org' },
    update: {},
    create: {
      name: 'Bikram Thapa',
      email: 'roads.staff@civora.org',
      passwordHash: await hashPassword('Staff123!'),
      role: Role.ORG_STAFF,
      isVerified: true,
    },
  });

  const wasteStaff = await prisma.user.upsert({
    where: { email: 'waste.staff@civora.org' },
    update: {},
    create: {
      name: 'Sunita Rai',
      email: 'waste.staff@civora.org',
      passwordHash: await hashPassword('Staff123!'),
      role: Role.ORG_STAFF,
      isVerified: true,
    },
  });

  const waterStaff = await prisma.user.upsert({
    where: { email: 'water.staff@civora.org' },
    update: {},
    create: {
      name: 'Deepak Adhikari',
      email: 'water.staff@civora.org',
      passwordHash: await hashPassword('Staff123!'),
      role: Role.ORG_STAFF,
      isVerified: true,
    },
  });

  // Citizens with realistic Nepali names
  const citizenNames = [
    { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com' },
    { name: 'Priya Basnet', email: 'priya.basnet@gmail.com' },
    { name: 'Rajan Poudel', email: 'rajan.poudel@gmail.com' },
    { name: 'Sita Maharjan', email: 'sita.maharjan@gmail.com' },
    { name: 'Binod KC', email: 'binod.kc@gmail.com' },
    { name: 'Anita Tamang', email: 'anita.tamang@gmail.com' },
    { name: 'Krishna Shrestha', email: 'krishna.shrestha@gmail.com' },
    { name: 'Laxmi Gurung', email: 'laxmi.gurung@gmail.com' },
    { name: 'Dipesh Bhattarai', email: 'dipesh.bhattarai@gmail.com' },
    { name: 'Mina Rana', email: 'mina.rana@gmail.com' },
    { name: 'Suresh Lama', email: 'suresh.lama@gmail.com' },
    { name: 'Kamala Thapa', email: 'kamala.thapa@gmail.com' },
    { name: 'Nabin Karki', email: 'nabin.karki@gmail.com' },
    { name: 'Sarita Joshi', email: 'sarita.joshi@gmail.com' },
    { name: 'Prakash Magar', email: 'prakash.magar@gmail.com' },
    { name: 'Geeta Pandey', email: 'geeta.pandey@gmail.com' },
    { name: 'Arun Sapkota', email: 'arun.sapkota@gmail.com' },
    { name: 'Nirmala Dhakal', email: 'nirmala.dhakal@gmail.com' },
    { name: 'Bibek Gautam', email: 'bibek.gautam@gmail.com' },
    { name: 'Pooja Neupane', email: 'pooja.neupane@gmail.com' },
    { name: 'Ramesh Bhandari', email: 'ramesh.bhandari@gmail.com' },
    { name: 'Sabina Ghimire', email: 'sabina.ghimire@gmail.com' },
    { name: 'Manoj Oli', email: 'manoj.oli@gmail.com' },
    { name: 'Reshma Subedi', email: 'reshma.subedi@gmail.com' },
    { name: 'Santosh Khadka', email: 'santosh.khadka@gmail.com' },
  ];

  const citizens: Array<{ id: string; name: string }> = [];
  for (const citizen of citizenNames) {
    const created = await prisma.user.upsert({
      where: { email: citizen.email },
      update: {},
      create: {
        name: citizen.name,
        email: citizen.email,
        passwordHash: citizenPassword,
        role: Role.CITIZEN,
        isVerified: true,
      },
    });
    citizens.push({ id: created.id, name: created.name });
  }

  console.log(`  ✅ Created ${citizens.length + 5} users\n`);

  // ============================================================
  // STEP 6: Create Organization Memberships
  // ============================================================
  console.log('🔗 Linking users to organizations...');

  // Pokhara Metro memberships
  const membershipData = [
    { orgId: pokharaOrg.id, userId: pokharaAdmin.id, deptId: null, role: Role.ORG_ADMIN },
    { orgId: pokharaOrg.id, userId: roadsStaff.id, deptId: depts['road-infrastructure'], role: Role.ORG_STAFF },
    { orgId: pokharaOrg.id, userId: wasteStaff.id, deptId: depts['waste-management'], role: Role.ORG_STAFF },
    { orgId: pokharaOrg.id, userId: waterStaff.id, deptId: depts['water-drainage'], role: Role.ORG_STAFF },
  ];

  for (const m of membershipData) {
    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: m.orgId, userId: m.userId } },
      update: {},
      create: {
        organizationId: m.orgId,
        userId: m.userId,
        departmentId: m.deptId,
        role: m.role,
      },
    });
  }
  console.log(`  ✅ Created organization memberships\n`);

  // ============================================================
  // STEP 7: Create Reputation Records
  // ============================================================
  console.log('⭐ Creating reputation records...');

  const reputationLevels: [number, ReputationLevel][] = [
    [150, ReputationLevel.COMMUNITY_CHAMPION],
    [100, ReputationLevel.VERIFIED_CONTRIBUTOR],
    [50, ReputationLevel.COMMUNITY_CONTRIBUTOR],
    [10, ReputationLevel.NEW_CONTRIBUTOR],
  ];

  for (let i = 0; i < citizens.length; i++) {
    const [points, level] = reputationLevels[i % reputationLevels.length];
    await prisma.reputation.upsert({
      where: { userId: citizens[i].id },
      update: {},
      create: {
        userId: citizens[i].id,
        points: points + Math.floor(Math.random() * 20),
        level,
        helpfulVotes: Math.floor(Math.random() * 30),
      },
    });
  }
  console.log(`  ✅ Created reputation records\n`);

  // ============================================================
  // STEP 8: Create Profiles
  // ============================================================
  console.log('📝 Creating user profiles...');

  const pokharaLocations = [
    { city: 'Pokhara', ward: 'Ward 1', lat: 28.2096, lng: 83.9856 },
    { city: 'Pokhara', ward: 'Ward 6', lat: 28.2150, lng: 83.9580 },
    { city: 'Pokhara', ward: 'Ward 9', lat: 28.2000, lng: 83.9750 },
    { city: 'Pokhara', ward: 'Ward 11', lat: 28.2320, lng: 83.9870 },
    { city: 'Pokhara', ward: 'Ward 17', lat: 28.1890, lng: 83.9620 },
  ];

  const ktmLocations = [
    { city: 'Kathmandu', ward: 'Ward 4', lat: 27.7100, lng: 85.3150 },
    { city: 'Kathmandu', ward: 'Ward 16', lat: 27.7050, lng: 85.3250 },
    { city: 'Kathmandu', ward: 'Ward 26', lat: 27.6850, lng: 85.3420 },
  ];

  for (let i = 0; i < citizens.length; i++) {
    const loc = i < 17
      ? pokharaLocations[i % pokharaLocations.length]
      : ktmLocations[i % ktmLocations.length];

    await prisma.profile.upsert({
      where: { userId: citizens[i].id },
      update: {},
      create: {
        userId: citizens[i].id,
        country: 'Nepal',
        province: loc.city === 'Pokhara' ? 'Gandaki' : 'Bagmati',
        district: loc.city === 'Pokhara' ? 'Kaski' : 'Kathmandu',
        city: loc.city,
        ward: loc.ward,
        latitude: loc.lat,
        longitude: loc.lng,
        reportsCount: Math.floor(Math.random() * 8) + 1,
        resolvedCount: Math.floor(Math.random() * 3),
      },
    });
  }
  console.log(`  ✅ Created user profiles\n`);

  // ============================================================
  // STEP 9: Create Subscriptions
  // ============================================================
  console.log('💳 Creating organization subscriptions...');

  await prisma.organizationSubscription.upsert({
    where: { organizationId: pokharaOrg.id },
    update: {},
    create: {
      organizationId: pokharaOrg.id,
      planId: plans[2].id, // Enterprise
      status: 'ACTIVE',
      isMock: true,
    },
  });

  await prisma.organizationSubscription.upsert({
    where: { organizationId: ktmOrg.id },
    update: {},
    create: {
      organizationId: ktmOrg.id,
      planId: plans[1].id, // Professional
      status: 'ACTIVE',
      isMock: true,
    },
  });

  await prisma.organizationSubscription.upsert({
    where: { organizationId: ngoOrg.id },
    update: {},
    create: {
      organizationId: ngoOrg.id,
      planId: plans[0].id, // Free
      status: 'ACTIVE',
      isMock: true,
    },
  });
  console.log(`  ✅ Created subscriptions\n`);

  // ============================================================
  // STEP 10: Create Issues
  // ============================================================
  console.log('🚨 Creating issues...');

  // Realistic Pokhara coordinates and addresses
  const pokharaIssues = [
    { title: 'Massive pothole on Lakeside Road near Hotel Barahi', description: 'A large pothole approximately 1 meter wide and 30cm deep has formed on the main Lakeside Road near Hotel Barahi. Multiple vehicles have been damaged. The hole fills with water during rain making it invisible to drivers. Two motorcyclists fell last week due to this pothole.', lat: 28.2089, lng: 83.9580, address: 'Lakeside Road, Near Hotel Barahi', city: 'Pokhara', ward: 'Ward 6', category: 'road-damage', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 500, status: 'VERIFIED' as IssueStatus, emergency: false },
    { title: 'Overflowing garbage dump at Mahendrapul intersection', description: 'The public garbage collection point at Mahendrapul intersection has not been cleaned for over a week. Garbage is spilling onto the road and footpath. Strong smell is affecting nearby shops and residents. Dogs and crows are spreading waste further.', lat: 28.2150, lng: 83.9856, address: 'Mahendrapul Chowk', city: 'Pokhara', ward: 'Ward 9', category: 'waste-management', severity: 'HIGH' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 300, status: 'ASSIGNED' as IssueStatus, emergency: false },
    { title: 'Burst water pipe flooding Chipledhunga market area', description: 'A main water supply pipe has burst at Chipledhunga, causing water to flood the market area. Several shops have reported water damage. The leak started two days ago and is getting worse. Clean water is being wasted while many areas face shortages.', lat: 28.2120, lng: 83.9900, address: 'Chipledhunga Market', city: 'Pokhara', ward: 'Ward 11', category: 'water-supply', severity: 'CRITICAL' as Severity, safety: 'HIGH' as SafetyRisk, affected: 200, status: 'IN_PROGRESS' as IssueStatus, emergency: true },
    { title: 'Blocked storm drain causing street flooding at Prithvi Chowk', description: 'The storm drain at Prithvi Chowk is completely blocked with debris and plastic waste. Even moderate rainfall causes the entire intersection to flood, disrupting traffic for hours. Stagnant water is becoming a breeding ground for mosquitoes.', lat: 28.2200, lng: 83.9856, address: 'Prithvi Narayan Chowk', city: 'Pokhara', ward: 'Ward 17', category: 'drainage-sewage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 400, status: 'VERIFIED' as IssueStatus, emergency: false },
    { title: 'All streetlights broken on Bagar road stretch', description: 'A 500-meter stretch of Bagar road has no working streetlights. The area becomes completely dark after sunset, creating safety concerns for pedestrians and cyclists. Multiple residents have reported feeling unsafe walking in this area at night.', lat: 28.2250, lng: 83.9750, address: 'Bagar Road', city: 'Pokhara', ward: 'Ward 1', category: 'street-lighting', severity: 'MEDIUM' as Severity, safety: 'HIGH' as SafetyRisk, affected: 150, status: 'REPORTED' as IssueStatus, emergency: false },
    { title: 'Dangerous crack in Seti River bridge railing', description: 'A large crack has appeared in the railing of the bridge over Seti River near KI Singh Bridge. The crack is widening and pieces of concrete have started falling. This is a major safety hazard for pedestrians and could cause the railing to collapse.', lat: 28.2180, lng: 83.9790, address: 'KI Singh Bridge, Seti River', city: 'Pokhara', ward: 'Ward 1', category: 'public-safety', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 600, status: 'IN_PROGRESS' as IssueStatus, emergency: true },
    { title: 'Illegal waste dumping in Phewa Lake area', description: 'Construction waste and plastic debris are being dumped along the eastern shore of Phewa Lake near the dam area. This is polluting the lake water and destroying the natural beauty of the area. Multiple loads of construction waste have been seen dumped at night.', lat: 28.2050, lng: 83.9520, address: 'Phewa Lake Eastern Shore, Dam Area', city: 'Pokhara', ward: 'Ward 6', category: 'environmental-hazard', severity: 'HIGH' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 1000, status: 'UNDER_REVIEW' as IssueStatus, emergency: false },
    { title: 'Collapsed retaining wall at Simalchaur', description: 'A 10-meter section of the retaining wall along the road at Simalchaur has collapsed after recent heavy rains. Soil and rocks are partially blocking the road. There is risk of further collapse.', lat: 28.2300, lng: 83.9920, address: 'Simalchaur Road', city: 'Pokhara', ward: 'Ward 17', category: 'public-infrastructure', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 250, status: 'ASSIGNED' as IssueStatus, emergency: false },
    { title: 'Sewage overflow into residential area at Nayabazar', description: 'Raw sewage is overflowing from a manhole at Nayabazar and flowing into the residential area. The smell is unbearable and children are at risk of disease. This has been happening intermittently for two weeks.', lat: 28.2190, lng: 83.9880, address: 'Nayabazar, Near Public School', city: 'Pokhara', ward: 'Ward 11', category: 'drainage-sewage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 300, status: 'REPORTED' as IssueStatus, emergency: false },
    { title: 'Road completely washed out near Bindabasini Temple', description: 'Heavy monsoon rains have completely washed out a section of the road leading to Bindabasini Temple. Vehicles cannot pass and pedestrians are using a dangerous alternate route along the hillside.', lat: 28.2280, lng: 83.9830, address: 'Bindabasini Road', city: 'Pokhara', ward: 'Ward 1', category: 'road-damage', severity: 'CRITICAL' as Severity, safety: 'HIGH' as SafetyRisk, affected: 350, status: 'VERIFIED' as IssueStatus, emergency: false },
    // Resolved issues (with before/after)
    { title: 'Pothole repaired on New Road near Bus Park', description: 'Large pothole that was causing accidents on New Road has been reported and needs repair. The pothole is about 2 feet wide.', lat: 28.2160, lng: 83.9860, address: 'New Road, Near Bus Park', city: 'Pokhara', ward: 'Ward 9', category: 'road-damage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 400, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Garbage cleanup completed at Hallanchowk', description: 'Accumulated garbage at Hallanchowk junction has been a health hazard for weeks. Immediate cleanup required.', lat: 28.2100, lng: 83.9830, address: 'Hallanchowk Junction', city: 'Pokhara', ward: 'Ward 9', category: 'waste-management', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 200, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Streetlights restored on Dam Side road', description: 'The entire Dam Side road stretch had no functional streetlights for a month. Very dangerous for tourists and locals at night.', lat: 28.2040, lng: 83.9560, address: 'Dam Side Road', city: 'Pokhara', ward: 'Ward 6', category: 'street-lighting', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 180, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Water pipe leak fixed at Mustang Chowk', description: 'Underground water pipe was leaking for weeks at Mustang Chowk, wasting clean water and creating puddles on the road.', lat: 28.2140, lng: 83.9810, address: 'Mustang Chowk', city: 'Pokhara', ward: 'Ward 1', category: 'water-supply', severity: 'MEDIUM' as Severity, safety: 'LOW' as SafetyRisk, affected: 120, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Drainage clearing completed at Zero KM', description: 'Drainage channels at Zero KM were clogged causing flooding during monsoon.', lat: 28.2220, lng: 83.9900, address: 'Zero KM', city: 'Pokhara', ward: 'Ward 17', category: 'drainage-sewage', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 250, status: 'RESOLVED' as IssueStatus, emergency: false },
    // More reported
    { title: 'Cracked sidewalk tripping hazard at Lakeside', description: 'Multiple sections of the sidewalk along Lakeside tourist area are severely cracked and uneven. Tourists and elderly people are tripping. One tourist broke their ankle last week.', lat: 28.2070, lng: 83.9570, address: 'Lakeside Walking Path', city: 'Pokhara', ward: 'Ward 6', category: 'road-damage', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 200, status: 'REPORTED' as IssueStatus, emergency: false },
    { title: 'Water contamination in Ward 11 supply', description: 'Residents of Ward 11 are reporting muddy and foul-smelling water from the municipal supply. Several families have fallen sick. Water quality testing is urgently needed.', lat: 28.2135, lng: 83.9910, address: 'Ward 11 Supply Zone', city: 'Pokhara', ward: 'Ward 11', category: 'water-supply', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 800, status: 'VERIFIED' as IssueStatus, emergency: true },
    { title: 'Fallen tree blocking road at Ranipauwa', description: 'A large tree has fallen across the road at Ranipauwa during last nights storm. Traffic is completely blocked and vehicles are diverting through narrow village lanes.', lat: 28.2350, lng: 83.9780, address: 'Ranipauwa Main Road', city: 'Pokhara', ward: 'Ward 1', category: 'public-safety', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 300, status: 'IN_PROGRESS' as IssueStatus, emergency: false },
    { title: 'Missing manhole cover near Pokhara University', description: 'An open manhole without a cover on the road near Pokhara University campus. Extremely dangerous especially at night. A motorcycle nearly fell in last evening.', lat: 28.1900, lng: 83.9650, address: 'Near Pokhara University', city: 'Pokhara', ward: 'Ward 17', category: 'public-safety', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 500, status: 'ASSIGNED' as IssueStatus, emergency: false },
    { title: 'Garbage pile at Phirke area for 2 weeks', description: 'Large pile of uncollected garbage has been rotting at Phirke for two weeks. The municipal truck has not come for collection. Strong odor and flies everywhere.', lat: 28.2080, lng: 83.9700, address: 'Phirke Chowk', city: 'Pokhara', ward: 'Ward 1', category: 'waste-management', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 150, status: 'REPORTED' as IssueStatus, emergency: false },
    // Resolved
    { title: 'Fixed collapsed drainage at Airport Road', description: 'Drainage system near Pokhara Airport road collapsed causing road flooding.', lat: 28.2000, lng: 83.9820, address: 'Airport Road', city: 'Pokhara', ward: 'Ward 9', category: 'drainage-sewage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 400, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Repaired damaged bus stop shelter at Prithvi Chowk', description: 'The bus stop shelter at Prithvi Chowk was severely damaged, with no roof protection for waiting passengers.', lat: 28.2210, lng: 83.9850, address: 'Prithvi Chowk Bus Stop', city: 'Pokhara', ward: 'Ward 17', category: 'public-infrastructure', severity: 'LOW' as Severity, safety: 'LOW' as SafetyRisk, affected: 100, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Chemical runoff into stream at Industrial Area', description: 'Blue-colored chemical runoff is flowing from an industrial unit into the local stream near the Industrial Area. Fish have been found dead downstream. Local farmers are worried about crop irrigation water.', lat: 28.1950, lng: 83.9950, address: 'Industrial Area, South', city: 'Pokhara', ward: 'Ward 17', category: 'environmental-hazard', severity: 'CRITICAL' as Severity, safety: 'HIGH' as SafetyRisk, affected: 500, status: 'UNDER_REVIEW' as IssueStatus, emergency: false },
    // Reopened
    { title: 'Recurring pothole on Siddhartha Highway near Hemja', description: 'This pothole was "fixed" two weeks ago but has reopened even larger than before. The patching was clearly inadequate. Heavy vehicles are now avoiding this lane entirely.', lat: 28.2400, lng: 83.9700, address: 'Siddhartha Highway, Hemja', city: 'Pokhara', ward: 'Ward 1', category: 'road-damage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 350, status: 'REOPENED' as IssueStatus, emergency: false },
    { title: 'Sewage backup returns at Nayabazar school', description: 'The sewage line near Nayabazar School was cleaned last month but has backed up again. Children are being exposed to unsanitary conditions. A long-term solution is needed, not temporary fixes.', lat: 28.2195, lng: 83.9885, address: 'Nayabazar, Near Primary School', city: 'Pokhara', ward: 'Ward 11', category: 'drainage-sewage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 200, status: 'REOPENED' as IssueStatus, emergency: false },
  ];

  // Kathmandu issues
  const ktmIssues = [
    { title: 'Massive sinkhole forming at New Road intersection', description: 'A sinkhole is developing at the busy New Road intersection near Dharahara. Cracks visible on the road surface are growing daily. If this collapses, it could endanger dozens of people and vehicles.', lat: 27.7050, lng: 85.3120, address: 'New Road, Near Dharahara', city: 'Kathmandu', ward: 'Ward 4', category: 'public-safety', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 1000, status: 'IN_PROGRESS' as IssueStatus, emergency: true },
    { title: 'Garbage mountain at Thamel entrance', description: 'A massive pile of garbage has accumulated at the entrance to Thamel from Kantipath. This is the first thing tourists see when entering Nepal most famous tourist hub. Terrible smell and unsightly view.', lat: 27.7150, lng: 85.3140, address: 'Thamel Entrance, Kantipath', city: 'Kathmandu', ward: 'Ward 4', category: 'waste-management', severity: 'HIGH' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 500, status: 'VERIFIED' as IssueStatus, emergency: false },
    { title: 'Broken water main flooding Baneshwor road', description: 'A major water main has broken at Old Baneshwor, flooding the road and nearby shops. Clean water is gushing out at high pressure. The area is already facing water shortage and this waste is unacceptable.', lat: 27.6900, lng: 85.3400, address: 'Old Baneshwor', city: 'Kathmandu', ward: 'Ward 26', category: 'water-supply', severity: 'CRITICAL' as Severity, safety: 'HIGH' as SafetyRisk, affected: 400, status: 'ASSIGNED' as IssueStatus, emergency: false },
    { title: 'Dark underpass at Baluwatar with no lighting', description: 'The pedestrian underpass at Baluwatar has had no functioning lights for 3 months. People are afraid to use it especially women. Some have reported being robbed in the darkness.', lat: 27.7200, lng: 85.3280, address: 'Baluwatar Underpass', city: 'Kathmandu', ward: 'Ward 4', category: 'street-lighting', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 300, status: 'REPORTED' as IssueStatus, emergency: false },
    { title: 'Crumbling pedestrian bridge at Bagmati River', description: 'The pedestrian bridge over Bagmati River near Thapathali is crumbling. Visible rebar is exposed, concrete chunks fall regularly. Hundreds of people cross this bridge daily.', lat: 27.6950, lng: 85.3200, address: 'Thapathali, Bagmati Bridge', city: 'Kathmandu', ward: 'Ward 16', category: 'public-infrastructure', severity: 'CRITICAL' as Severity, safety: 'EXTREME' as SafetyRisk, affected: 700, status: 'VERIFIED' as IssueStatus, emergency: false },
    // Resolved KTM
    { title: 'Fixed overflowing drain at Asan Tole', description: 'The main drainage at Asan Tole market was overflowing with market waste.', lat: 27.7080, lng: 85.3160, address: 'Asan Tole Market', city: 'Kathmandu', ward: 'Ward 4', category: 'drainage-sewage', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 500, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Road repaired at Putalisadak', description: 'Large potholes on Putalisadak road causing daily traffic jams.', lat: 27.7020, lng: 85.3200, address: 'Putalisadak', city: 'Kathmandu', ward: 'Ward 4', category: 'road-damage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 600, status: 'RESOLVED' as IssueStatus, emergency: false },
    { title: 'Restored lighting at Ratnapark', description: 'All streetlights around Ratna Park were non-functional for over a month.', lat: 27.7060, lng: 85.3140, address: 'Ratna Park', city: 'Kathmandu', ward: 'Ward 4', category: 'street-lighting', severity: 'MEDIUM' as Severity, safety: 'MEDIUM' as SafetyRisk, affected: 200, status: 'RESOLVED' as IssueStatus, emergency: false },
    // Rejected
    { title: 'Private parking lot has a crack', description: 'A crack in the parking lot of a private hotel at Thamel.', lat: 27.7160, lng: 85.3130, address: 'Thamel Private Hotel', city: 'Kathmandu', ward: 'Ward 4', category: 'road-damage', severity: 'LOW' as Severity, safety: 'LOW' as SafetyRisk, affected: 10, status: 'REJECTED' as IssueStatus, emergency: false },
    // Reopened
    { title: 'Recurring flooding at Kalanki underpass', description: 'The Kalanki underpass floods every time it rains despite previous drainage fixes. Water accumulates knee-deep disrupting traffic.', lat: 27.6930, lng: 85.2800, address: 'Kalanki Underpass', city: 'Kathmandu', ward: 'Ward 26', category: 'drainage-sewage', severity: 'HIGH' as Severity, safety: 'HIGH' as SafetyRisk, affected: 800, status: 'REOPENED' as IssueStatus, emergency: false },
  ];

  const allIssueData = [...pokharaIssues, ...ktmIssues];
  let issueCount = 0;
  const createdIssues: Array<{ id: string; status: IssueStatus; reporterId: string }> = [];

  for (const issueData of allIssueData) {
    const reporterIndex = issueCount % citizens.length;
    const reporter = citizens[reporterIndex];
    const trackingCode = `CIV-${1001 + issueCount}`;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Assign org based on city
    let assignedOrgId: string | null = null;
    let assignedDeptId: string | null = null;

    if (issueData.status !== 'REPORTED' && issueData.status !== 'REJECTED') {
      if (issueData.city === 'Pokhara') {
        assignedOrgId = pokharaOrg.id;
        // Assign department based on category
        if (issueData.category === 'road-damage' || issueData.category === 'public-infrastructure') {
          assignedDeptId = depts['road-infrastructure'];
        } else if (issueData.category === 'waste-management' || issueData.category === 'environmental-hazard') {
          assignedDeptId = depts['waste-management'];
        } else if (issueData.category === 'water-supply' || issueData.category === 'drainage-sewage') {
          assignedDeptId = depts['water-drainage'];
        } else if (issueData.category === 'street-lighting') {
          assignedDeptId = depts['electrical-lighting'];
        }
      } else {
        assignedOrgId = ktmOrg.id;
        assignedDeptId = depts['general-services'];
      }
    }

    const confirmations = Math.floor(Math.random() * 25) + 1;
    const disputes = Math.floor(Math.random() * 3);
    const followers = Math.floor(Math.random() * 20) + 2;

    const issue = await prisma.issue.create({
      data: {
        trackingCode,
        title: issueData.title,
        description: issueData.description,
        categoryId: categories[issueData.category],
        reporterId: reporter.id,
        status: issueData.status,
        severity: issueData.severity,
        isEmergency: issueData.emergency,
        safetyRisk: issueData.safety,
        affectedPeopleEst: issueData.affected,
        latitude: issueData.lat,
        longitude: issueData.lng,
        address: issueData.address,
        city: issueData.city,
        ward: issueData.ward,
        province: issueData.city === 'Pokhara' ? 'Gandaki' : 'Bagmati',
        district: issueData.city === 'Pokhara' ? 'Kaski' : 'Kathmandu',
        priorityScore: 30 + Math.floor(Math.random() * 50),
        priorityLevel: issueData.severity === 'CRITICAL' ? 'CRITICAL' : issueData.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
        communityConfidence: 40 + Math.floor(Math.random() * 40),
        confirmationsCount: confirmations,
        disputesCount: disputes,
        followersCount: followers,
        assignedOrgId,
        assignedDepartmentId: assignedDeptId,
        resolvedAt: issueData.status === 'RESOLVED' ? new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000) : null,
        createdAt,
      },
    });

    createdIssues.push({ id: issue.id, status: issueData.status, reporterId: reporter.id });
    issueCount++;
  }

  console.log(`  ✅ Created ${issueCount} issues\n`);

  // ============================================================
  // STEP 11: Create Confirmations, Disputes, Comments, History
  // ============================================================
  console.log('✅ Creating community interactions...');

  for (const issue of createdIssues) {
    // Add some confirmations (random citizens)
    const numConfirms = Math.min(5, Math.floor(Math.random() * 6) + 1);
    for (let i = 0; i < numConfirms; i++) {
      const citizenIndex = (createdIssues.indexOf(issue) + i + 3) % citizens.length;
      if (citizens[citizenIndex].id === issue.reporterId) continue;
      try {
        await prisma.issueConfirmation.create({
          data: {
            issueId: issue.id,
            userId: citizens[citizenIndex].id,
            comment: i === 0 ? 'Yes, I walk past this every day. Confirmed.' : null,
          },
        });
      } catch { /* unique constraint - skip */ }
    }

    // Add status history
    const statusFlow: IssueStatus[] = [];
    if (issue.status === 'VERIFIED') statusFlow.push('REPORTED', 'UNDER_REVIEW', 'VERIFIED');
    else if (issue.status === 'ASSIGNED') statusFlow.push('REPORTED', 'VERIFIED', 'ASSIGNED');
    else if (issue.status === 'IN_PROGRESS') statusFlow.push('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS');
    else if (issue.status === 'RESOLVED') statusFlow.push('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED');
    else if (issue.status === 'REOPENED') statusFlow.push('REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED');
    else if (issue.status === 'REJECTED') statusFlow.push('REPORTED', 'REJECTED');
    else statusFlow.push('REPORTED');

    for (let i = 1; i < statusFlow.length; i++) {
      await prisma.issueStatusHistory.create({
        data: {
          issueId: issue.id,
          changedById: i > 1 ? pokharaAdmin.id : null,
          oldStatus: statusFlow[i - 1],
          newStatus: statusFlow[i],
          comment: statusFlow[i] === 'VERIFIED' ? 'Verified by field team inspection' :
                   statusFlow[i] === 'ASSIGNED' ? 'Assigned to relevant department' :
                   statusFlow[i] === 'IN_PROGRESS' ? 'Field team dispatched for repair' :
                   statusFlow[i] === 'RESOLVED' ? 'Issue has been resolved. Please verify.' :
                   statusFlow[i] === 'REOPENED' ? 'Citizens report issue has resurfaced' :
                   statusFlow[i] === 'REJECTED' ? 'Not within municipal jurisdiction' :
                   null,
          createdAt: new Date(Date.now() - (statusFlow.length - i) * 2 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Add resolution evidence for resolved issues
    if (issue.status === 'RESOLVED') {
      await prisma.resolutionEvidence.create({
        data: {
          issueId: issue.id,
          submittedById: roadsStaff.id,
          afterImageUrl: '/uploads/resolved-placeholder.jpg',
          description: 'Issue has been addressed by the municipal field team. Road/infrastructure has been repaired and area cleaned. Please verify the resolution.',
          fixedVotes: Math.floor(Math.random() * 10) + 3,
          partiallyFixedVotes: Math.floor(Math.random() * 3),
          stillExistsVotes: Math.floor(Math.random() * 2),
        },
      });
    }

    // Add some comments
    if (Math.random() > 0.5) {
      const commentUser = citizens[Math.floor(Math.random() * citizens.length)];
      await prisma.issueComment.create({
        data: {
          issueId: issue.id,
          userId: commentUser.id,
          content: 'This issue is really affecting our daily commute. Hope it gets fixed soon.',
        },
      });
    }

    // Add official comment for in-progress/resolved issues
    if (['IN_PROGRESS', 'RESOLVED', 'ASSIGNED'].includes(issue.status)) {
      await prisma.issueComment.create({
        data: {
          issueId: issue.id,
          userId: pokharaAdmin.id,
          content: 'This issue has been noted and our team is working on it. We will provide updates as work progresses.',
          isOfficialUpdate: true,
        },
      });
    }

    // Add follows
    const numFollows = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numFollows; i++) {
      const ci = (createdIssues.indexOf(issue) + i + 7) % citizens.length;
      if (citizens[ci].id === issue.reporterId) continue;
      try {
        await prisma.issueFollow.create({
          data: { issueId: issue.id, userId: citizens[ci].id },
        });
      } catch { /* unique constraint - skip */ }
    }
  }

  console.log(`  ✅ Created community interactions\n`);

  // ============================================================
  // DONE!
  // ============================================================
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📌 Login Credentials:');
  console.log('  Platform Admin:  admin@civora.org / Admin123!');
  console.log('  Org Admin:       pokhara.admin@civora.org / Pokhara123!');
  console.log('  Org Staff:       roads.staff@civora.org / Staff123!');
  console.log('  Any Citizen:     aarav.sharma@gmail.com / Citizen123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
