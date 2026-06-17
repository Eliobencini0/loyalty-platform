/**
 * Data Migration: Generate initial API keys for existing merchants
 *
 * This script creates one "Default API Key" for each existing merchant
 * to ensure they can continue using the API after the API key system is deployed.
 *
 * Run with: npx ts-node prisma/scripts/migrate-merchants-to-api-keys.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateApiKey, hashApiKey } from '../../src/utils/apiKey';

const prisma = new PrismaClient();

async function main() {
  console.log('🔑 Starting API key migration for existing merchants...\n');

  // Find all merchants without API keys
  const merchants = await prisma.merchant.findMany({
    where: {
      active: true,
      apiKeys: {
        none: {}
      }
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  console.log(`Found ${merchants.length} merchants without API keys.\n`);

  if (merchants.length === 0) {
    console.log('✅ No migration needed. All active merchants already have API keys.');
    return;
  }

  const results: { merchantId: string; name: string; apiKey: string }[] = [];

  for (const merchant of merchants) {
    const plainApiKey = generateApiKey();
    const keyHash = await hashApiKey(plainApiKey);

    await prisma.apiKey.create({
      data: {
        merchantId: merchant.id,
        keyHash,
        name: 'Default API Key (Auto-generated)',
        active: true
      }
    });

    results.push({
      merchantId: merchant.id,
      name: merchant.name,
      apiKey: plainApiKey
    });

    console.log(`✓ Created API key for: ${merchant.name} (${merchant.email})`);
  }

  console.log(`\n✅ Migration complete! Generated ${results.length} API keys.\n`);
  console.log('⚠️  IMPORTANT: Save these API keys securely. They will not be shown again:\n');
  console.log('═'.repeat(80));

  results.forEach(({ merchantId, name, apiKey }) => {
    console.log(`Merchant: ${name}`);
    console.log(`ID:       ${merchantId}`);
    console.log(`API Key:  ${apiKey}`);
    console.log('─'.repeat(80));
  });

  console.log('\n📧 Send these API keys to the respective merchants via secure channels.');
  console.log('🔐 They should store them in their .env files as X-API-Key header values.\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
