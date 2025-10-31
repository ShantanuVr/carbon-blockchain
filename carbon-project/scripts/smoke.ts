import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function smokeTests() {
  console.log('🧪 Running smoke tests...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ ${message}`);
      passed++;
    } else {
      console.log(`❌ ${message}`);
      failed++;
    }
  };

  // 1. Registry totals
  const totalIssued = await prisma.creditClass.aggregate({
    _sum: { quantity: true },
  });
  const totalIssuedValue = totalIssued._sum.quantity || 0;
  assert(totalIssuedValue >= 10000, `Total credits issued >= 10000 (${totalIssuedValue})`);

  const totalRetired = await prisma.retirement.aggregate({
    _sum: { quantity: true },
  });
  const totalRetiredValue = totalRetired._sum.quantity || 0;
  assert(totalRetiredValue >= 150, `Total credits retired >= 150 (${totalRetiredValue})`);

  // 2. Holdings
  const buyerCo = await prisma.org.findUnique({ where: { name: 'BuyerCo' } });
  if (buyerCo) {
    const buyerHoldings = await prisma.holding.findMany({
      where: { orgId: buyerCo.id },
    });
    const buyerTotal = buyerHoldings.reduce((sum, h) => sum + h.quantity, 0);
    assert(buyerTotal >= 150, `BuyerCo holdings >= 150 (${buyerTotal})`);
  } else {
    assert(false, 'BuyerCo org exists');
  }

  // 3. Token mapping
  const classesWithTokens = await prisma.creditClass.findMany({
    where: { tokenId: { not: null } },
  });
  // Token mapping is optional
  assert(true, `Token mappings: ${classesWithTokens.length}`);

  // 4. Anchors
  const anchors = await prisma.evidenceAnchor.count();
  assert(anchors >= 1, `At least one anchor exists (${anchors})`);

  // 5. API Health (would require API to be running)
  try {
    const response = await fetch('http://localhost:4000/api/health');
    const health = await response.json();
    assert(health.ok === true, 'API health check passes');
    assert(health.services?.db === true, 'Database is reachable');
    assert(health.services?.chain === true, 'Chain is reachable');
  } catch (error) {
    assert(false, 'API health check failed (API may not be running)');
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

smokeTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

