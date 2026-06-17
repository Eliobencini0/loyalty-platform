/**
 * Setup test data for test-critical-fixes.js
 * Creates a test merchant, customer, and card
 * Outputs JSON with IDs for the test script to use
 */

import prisma from './src/prisma';

async function main() {
  try {
    // Create test merchant
    const merchant = await prisma.merchant.create({
      data: {
        name: 'Test Merchant',
        email: `test-${Date.now()}@example.com`,
        passwordHash: '$2a$10$dummyhashfortest', // bcrypt hash of "password123"
      },
    });

    // Create test customer
    const customer = await prisma.customer.create({
      data: {
        email: `test-customer-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'Customer',
      },
    });

    // Create test loyalty card
    const card = await prisma.loyaltyCard.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        cardNumber: `CARD-${Date.now()}`,
        pointsBalance: 50,
      },
    });

    // Output JSON for test script
    console.log(JSON.stringify({
      merchantId: merchant.id,
      customerId: customer.id,
      cardId: card.id,
    }));
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
