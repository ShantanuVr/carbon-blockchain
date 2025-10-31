import { PrismaClient, OrgRole, UserRole } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

// Inline generateDailyDigest function to avoid package build issues
function generateDailyDigest(projectType: string): {
  date: string;
  energyGenerated: number;
  creditsEarned: number;
  hash: string;
} {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  
  const baseGeneration: Record<string, number> = {
    SOLAR: 5000,
    WIND: 15000,
    HYDRO: 20000,
    RENEWABLE_ENERGY: 10000,
  };
  
  const energyGenerated = (baseGeneration[projectType] || 8000) + 
    Math.random() * 2000 - 1000;
  
  const creditsEarned = (energyGenerated * 0.475) / 1000; // kWh to tonnes CO2e
  
  const dataString = `${date.toISOString()}-${energyGenerated}-${creditsEarned}`;
  const hash = Buffer.from(dataString).toString('base64').substring(0, 64);
  
  return {
    date: date.toISOString().split('T')[0],
    energyGenerated: Math.round(energyGenerated * 100) / 100,
    creditsEarned: Math.round(creditsEarned * 1000) / 1000,
    hash,
  };
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Orgs
  const adminOrg = await prisma.org.upsert({
    where: { name: 'AdminOrg' },
    update: {},
    create: {
      name: 'AdminOrg',
      role: OrgRole.ADMIN,
    },
  });

  const verifierOrg = await prisma.org.upsert({
    where: { name: 'VerifierOrg' },
    update: {},
    create: {
      name: 'VerifierOrg',
      role: OrgRole.VERIFIER,
    },
  });

  const issuerOrg = await prisma.org.upsert({
    where: { name: 'IssuerCo' },
    update: {},
    create: {
      name: 'IssuerCo',
      role: OrgRole.ISSUER,
    },
  });

  const buyerOrg = await prisma.org.upsert({
    where: { name: 'BuyerCo' },
    update: {},
    create: {
      name: 'BuyerCo',
      role: OrgRole.BUYER,
    },
  });

  console.log('✅ Orgs created');

  // 2. Create Users
  // Simple hash for seeding (in production, use bcrypt)
  const password = crypto.createHash('sha256').update('password123').digest('hex');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.org' },
    update: {},
    create: {
      email: 'admin@admin.org',
      password,
      orgId: adminOrg.id,
      role: UserRole.ADMIN,
    },
  });

  const issuerUser = await prisma.user.upsert({
    where: { email: 'issuer@issuer.co' },
    update: {},
    create: {
      email: 'issuer@issuer.co',
      password,
      orgId: issuerOrg.id,
      role: UserRole.ORG_ADMIN,
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@buyer.co' },
    update: {},
    create: {
      email: 'buyer@buyer.co',
      password,
      orgId: buyerOrg.id,
      role: UserRole.ORG_ADMIN,
    },
  });

  console.log('✅ Users created (password: password123)');

  // 3. Create Project
  const project = await prisma.project.upsert({
    where: { code: 'PRJ-WIND-001' },
    update: {},
    create: {
      code: 'PRJ-WIND-001',
      type: 'WIND',
      orgId: issuerOrg.id,
      metadata: {
        location: 'California, USA',
        capacity: '50MW',
      },
    },
  });

  console.log('✅ Project created:', project.code);

  // 4. Add Evidence
  const evidenceDir = process.env.FILES_DIR || './var/evidence';
  await fs.mkdir(evidenceDir, { recursive: true });
  
  const sampleEvidence = Buffer.from('Sample evidence document content');
  const sha256 = crypto.createHash('sha256').update(sampleEvidence).digest('hex');
  const evidencePath = path.join(evidenceDir, `${sha256}.pdf`);
  await fs.writeFile(evidencePath, sampleEvidence);

  await prisma.evidenceArtifact.upsert({
    where: { sha256 },
    update: {},
    create: {
      projectId: project.id,
      sha256,
      bytes: sampleEvidence.length,
      uri: evidencePath,
    },
  });

  console.log('✅ Evidence artifact added');

  // 5. Create Credit Class
  const vintage = 2024;
  const quantity = 10000;
  const creditClass = await prisma.creditClass.upsert({
    where: { id: 'temp-id' },
    update: {},
    create: {
      projectId: project.id,
      vintage,
      quantity,
      serialBase: 1,
      serialTop: quantity,
    },
  });

  // Update with proper ID
  const finalClass = await prisma.creditClass.findFirst({
    where: { projectId: project.id, vintage },
  });

  console.log('✅ Credit class created:', finalClass?.id);

  // 6. Create Initial Holding
  if (finalClass) {
    await prisma.holding.upsert({
      where: { orgId_classId: { orgId: issuerOrg.id, classId: finalClass.id } },
      update: { quantity: quantity },
      create: {
        orgId: issuerOrg.id,
        classId: finalClass.id,
        quantity,
      },
    });
  }

  console.log('✅ Initial holdings created');

  // 7. Transfer Credits
  if (finalClass) {
    await prisma.transfer.create({
      data: {
        fromOrgId: issuerOrg.id,
        toOrgId: buyerOrg.id,
        classId: finalClass.id,
        quantity: 300,
      },
    });

    await prisma.holding.upsert({
      where: { orgId_classId: { orgId: buyerOrg.id, classId: finalClass.id } },
      update: { quantity: { increment: 300 } },
      create: {
        orgId: buyerOrg.id,
        classId: finalClass.id,
        quantity: 300,
      },
    });

    await prisma.holding.update({
      where: { orgId_classId: { orgId: issuerOrg.id, classId: finalClass.id } },
      data: { quantity: { decrement: 300 } },
    });

    console.log('✅ Transfer created: 300 credits IssuerCo → BuyerCo');
  }

  // 8. Retire Credits
  if (finalClass) {
    const retirement = await prisma.retirement.create({
      data: {
        orgId: buyerOrg.id,
        classId: finalClass.id,
        quantity: 150,
        serialStart: 1,
        serialEnd: 150,
        purposeHash: '0x' + Buffer.from('Offset 2024 Q1 emissions').toString('hex').slice(0, 62),
        beneficiaryHash: '0x' + Buffer.from('BuyerCo Inc').toString('hex').slice(0, 62),
        certificateId: `CERT-${Date.now()}`,
      },
    });

    await prisma.holding.update({
      where: { orgId_classId: { orgId: buyerOrg.id, classId: finalClass.id } },
      data: { quantity: { decrement: 150 } },
    });

    console.log('✅ Retirement created:', retirement.certificateId);
  }

  // 9. Generate IoT Digest and Anchor
  const digest = generateDailyDigest('WIND');
  const hashBytes = Buffer.from(digest.hash, 'base64');
  const hashHex = '0x' + hashBytes.toString('hex');

  await prisma.evidenceAnchor.upsert({
    where: { hash: hashHex },
    update: {},
    create: {
      hash: hashHex,
      uri: `evidence://${digest.date}`,
      txHash: `0x${Buffer.from(`anchor-${Date.now()}`).toString('hex').slice(0, 64)}`,
      chainId: 31337,
    },
  });

  console.log('✅ IoT digest anchored');

  console.log('\n📊 Summary:');
  console.log(`- Orgs: ${await prisma.org.count()}`);
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Projects: ${await prisma.project.count()}`);
  console.log(`- Classes: ${await prisma.creditClass.count()}`);
  console.log(`- Retirements: ${await prisma.retirement.count()}`);
  console.log(`- Anchors: ${await prisma.evidenceAnchor.count()}`);
  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

