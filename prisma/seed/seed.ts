import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data (order matters for FK constraints)
  await prisma.walletAccessToken.deleteMany();
  await prisma.walletScanToken.deleteMany();
  await prisma.walletPass.deleteMany();
  await prisma.prizeWin.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.gamificationCampaign.deleteMany();
  await prisma.merchantFeedback.deleteMany();
  await prisma.pointsTransaction.deleteMany();
  await prisma.loyaltyCard.deleteMany();
  await prisma.rewardTier.deleteMany();
  await prisma.loyaltyProgram.deleteMany();
  await prisma.cardTemplate.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.merchant.deleteMany();

  // All merchants share the same password for demo: "password123"
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create merchants
  const cafe = await prisma.merchant.create({
    data: {
      name: "Bean & Brew Café",
      email: "hello@beanandbrew.com",
      phone: "+1-555-0101",
      address: "42 Main Street",
      city: "Portland",
      country: "US",
      plan: "STARTER",
      passwordHash,
      settings: JSON.stringify({ currency: "USD", timezone: "America/Los_Angeles" }),
    },
  });

  const restaurant = await prisma.merchant.create({
    data: {
      name: "Trattoria Roma",
      email: "info@trattoriaroma.com",
      phone: "+1-555-0202",
      address: "88 Oak Avenue",
      city: "San Francisco",
      country: "US",
      plan: "PROFESSIONAL",
      passwordHash,
      settings: JSON.stringify({ currency: "USD", timezone: "America/Los_Angeles", googleMapsUrl: "https://maps.google.com/?cid=12345" }),
    },
  });

  const barelio = await prisma.merchant.create({
    data: {
      name: "Barelio",
      email: "barelio@example.com",
      phone: "+39-345-000-0000",
      city: "Milan",
      country: "IT",
      preferredLocale: "it",
      passwordHash,
      plan: "PROFESSIONAL",
      settings: JSON.stringify({ currency: "EUR", timezone: "Europe/Rome", googleMapsUrl: "https://maps.google.com/?cid=67890" }),
    },
  });

  // Create card templates
  const cafeStandard = await prisma.cardTemplate.create({
    data: {
      merchantId: cafe.id,
      name: "Coffee Lover",
      description: "Earn 1 point per dollar spent on drinks",
      tier: "STANDARD",
      pointsPerCurrency: 1,
      redemptionRate: 0.01,
      minRedeemPoints: 50,
      bonusMultiplier: 1,
      validityDays: 365,
    },
  });

  const cafeGold = await prisma.cardTemplate.create({
    data: {
      merchantId: cafe.id,
      name: "Gold Bean",
      description: "Premium tier — 2x points on all purchases",
      tier: "GOLD",
      pointsPerCurrency: 2,
      redemptionRate: 0.02,
      minRedeemPoints: 25,
      bonusMultiplier: 2,
      validityDays: 730,
    },
  });

  const restaurantStandard = await prisma.cardTemplate.create({
    data: {
      merchantId: restaurant.id,
      name: "Amici Card",
      description: "Earn points on every meal",
      tier: "STANDARD",
      pointsPerCurrency: 1.5,
      redemptionRate: 0.015,
      minRedeemPoints: 100,
      bonusMultiplier: 1,
    },
  });

  const barelioCardTemplate = await prisma.cardTemplate.create({
    data: {
      merchantId: barelio.id,
      name: "Barelio Rewards",
      description: "Points for every order",
      tier: "STANDARD",
      pointsPerCurrency: 1,
      redemptionRate: 0.01,
      minRedeemPoints: 100,
      bonusMultiplier: 1,
    },
  });

  const barelioProgram = await prisma.loyaltyProgram.create({
    data: {
      merchantId: barelio.id,
      type: "POINTS",
      pointsPerCurrency: 1,
      rewardTiers: {
        create: [
          { name: "Bronze", threshold: 100, rewardName: "Free Coffee", sortOrder: 0 },
          { name: "Silver", threshold: 200, rewardName: "Free Breakfast", sortOrder: 1 },
        ],
      },
    },
    include: { rewardTiers: true },
  });

  // Create customers
  const alice = await prisma.customer.create({
    data: {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Johnson",
      phone: "+1-555-1001",
    },
  });

  const bob = await prisma.customer.create({
    data: {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Martinez",
      phone: "+1-555-1002",
    },
  });

  // Create loyalty cards
  const aliceCafeCard = await prisma.loyaltyCard.create({
    data: {
      cardNumber: "BB-2026-0001",
      merchantId: cafe.id,
      customerId: alice.id,
      cardTemplateId: cafeGold.id,
      pointsBalance: 240,
      totalEarned: 340,
      totalRedeemed: 100,
    },
  });

  const bobCafeCard = await prisma.loyaltyCard.create({
    data: {
      cardNumber: "BB-2026-0002",
      merchantId: cafe.id,
      customerId: bob.id,
      cardTemplateId: cafeStandard.id,
      pointsBalance: 75,
      totalEarned: 75,
      totalRedeemed: 0,
    },
  });

  const aliceRestaurantCard = await prisma.loyaltyCard.create({
    data: {
      cardNumber: "TR-2026-0001",
      merchantId: restaurant.id,
      customerId: alice.id,
      cardTemplateId: restaurantStandard.id,
      pointsBalance: 450,
      totalEarned: 450,
      totalRedeemed: 0,
    },
  });

  const bobBarelioCard = await prisma.loyaltyCard.create({
    data: {
      cardNumber: "BR-2026-0001",
      merchantId: barelio.id,
      customerId: bob.id,
      cardTemplateId: barelioCardTemplate.id,
      pointsBalance: 92,
      totalEarned: 110,
      totalRedeemed: 18,
    },
  });

  // Create points transactions
  await prisma.pointsTransaction.createMany({
    data: [
      {
        loyaltyCardId: aliceCafeCard.id,
        type: "EARN",
        points: 200,
        balanceAfter: 200,
        description: "Purchase — 2x Gold Bean bonus",
      },
      {
        loyaltyCardId: aliceCafeCard.id,
        type: "EARN",
        points: 140,
        balanceAfter: 340,
        description: "Purchase — 2x Gold Bean bonus",
      },
      {
        loyaltyCardId: aliceCafeCard.id,
        type: "REDEEM",
        points: -100,
        balanceAfter: 240,
        description: "Redeemed for free latte",
      },
      {
        loyaltyCardId: bobCafeCard.id,
        type: "EARN",
        points: 75,
        balanceAfter: 75,
        description: "Purchase",
      },
      {
        loyaltyCardId: aliceRestaurantCard.id,
        type: "EARN",
        points: 300,
        balanceAfter: 300,
        description: "Dinner for two",
      },
      {
        loyaltyCardId: aliceRestaurantCard.id,
        type: "BONUS",
        points: 150,
        balanceAfter: 450,
        description: "Welcome bonus",
      },
      {
        loyaltyCardId: bobBarelioCard.id,
        type: "EARN",
        points: 55,
        balanceAfter: 55,
        description: "Lunch order",
      },
      {
        loyaltyCardId: bobBarelioCard.id,
        type: "EARN",
        points: 55,
        balanceAfter: 110,
        description: "Dinner order",
      },
      {
        loyaltyCardId: bobBarelioCard.id,
        type: "REDEEM",
        points: -18,
        balanceAfter: 92,
        description: "Small reward redeemed",
      },
    ],
  });

  // ─── Gamification campaigns ──────────────────────────────────

  const cafeCampaign = await prisma.gamificationCampaign.create({
    data: {
      merchantId: cafe.id,
      name: "Summer Scratch & Win",
      description: "Scratch to win free drinks and discounts!",
      gameType: "SCRATCH_CARD",
      active: true,
      prizes: {
        create: [
          { name: "Free Espresso", description: "One free espresso on your next visit", prizeType: "DIGITAL", probability: 40, validityDays: 14 },
          { name: "50% Off Pastry", description: "Half price on any pastry", prizeType: "DIGITAL", probability: 30, validityDays: 7 },
          { name: "Free Latte", description: "One free latte of any size", prizeType: "DIGITAL", probability: 20, validityDays: 14 },
          { name: "Coffee Mug", description: "Exclusive Bean & Brew branded mug", prizeType: "PHYSICAL", probability: 10, validityDays: 30 },
        ],
      },
    },
  });

  const barelioCampaign = await prisma.gamificationCampaign.create({
    data: {
      merchantId: barelio.id,
      name: "Gratta e Vinci Barelio",
      description: "Gratta per vincere premi esclusivi!",
      gameType: "SCRATCH_CARD",
      active: true,
      prizes: {
        create: [
          { name: "Caffè Gratis", description: "Un caffè offerto da Barelio", prizeType: "DIGITAL", probability: 40, validityDays: 7 },
          { name: "Sconto 20%", description: "20% di sconto sul prossimo ordine", prizeType: "DIGITAL", probability: 35, validityDays: 14 },
          { name: "Pranzo per Due", description: "Un pranzo per due persone", prizeType: "DIGITAL", probability: 15, validityDays: 30 },
          { name: "T-Shirt Barelio", description: "T-shirt esclusiva Barelio", prizeType: "PHYSICAL", probability: 10, validityDays: 30 },
        ],
      },
    },
  });

  const restaurantCampaign = await prisma.gamificationCampaign.create({
    data: {
      merchantId: restaurant.id,
      name: "Lucky Spin Night",
      description: "Spin the wheel for amazing dining rewards!",
      gameType: "SPIN_WHEEL",
      active: true,
      prizes: {
        create: [
          { name: "Free Dessert", description: "Any dessert on the house", prizeType: "DIGITAL", probability: 35, validityDays: 14 },
          { name: "Complimentary Appetizer", description: "Free appetizer with your meal", prizeType: "DIGITAL", probability: 30, validityDays: 14 },
          { name: "Bottle of Wine", description: "House wine on the house", prizeType: "PHYSICAL", probability: 20, validityDays: 30 },
          { name: "Chef's Dinner", description: "Exclusive chef's tasting menu for two", prizeType: "DIGITAL", probability: 15, validityDays: 30 },
        ],
      },
    },
  });

  // ─── More customers for richer data ────────────────────────

  const charlie = await prisma.customer.create({
    data: { email: "charlie@example.com", firstName: "Charlie", lastName: "Wilson", phone: "+1-555-1003" },
  });

  const diana = await prisma.customer.create({
    data: { email: "diana@example.com", firstName: "Diana", lastName: "Chen", phone: "+1-555-1004" },
  });

  const marco = await prisma.customer.create({
    data: { email: "marco@example.com", firstName: "Marco", lastName: "Rossi", phone: "+39-333-1234567", preferredLocale: "it" },
  });

  // Loyalty cards for new customers
  const charlieCafeCard = await prisma.loyaltyCard.create({
    data: { cardNumber: "BB-2026-0003", merchantId: cafe.id, customerId: charlie.id, cardTemplateId: cafeStandard.id, pointsBalance: 45, totalEarned: 45 },
  });
  const dianaRestCard = await prisma.loyaltyCard.create({
    data: { cardNumber: "TR-2026-0002", merchantId: restaurant.id, customerId: diana.id, cardTemplateId: restaurantStandard.id, pointsBalance: 180, totalEarned: 200, totalRedeemed: 20 },
  });
  const marcoBarelioCard = await prisma.loyaltyCard.create({
    data: { cardNumber: "BR-2026-0002", merchantId: barelio.id, customerId: marco.id, cardTemplateId: barelioCardTemplate.id, pointsBalance: 150, totalEarned: 150 },
  });

  // Transactions for new customers
  await prisma.pointsTransaction.createMany({
    data: [
      { loyaltyCardId: charlieCafeCard.id, type: "EARN", points: 45, balanceAfter: 45, description: "Morning coffees" },
      { loyaltyCardId: dianaRestCard.id, type: "EARN", points: 200, balanceAfter: 200, description: "Family dinner" },
      { loyaltyCardId: dianaRestCard.id, type: "REDEEM", points: -20, balanceAfter: 180, description: "Dessert reward" },
      { loyaltyCardId: marcoBarelioCard.id, type: "EARN", points: 80, balanceAfter: 80, description: "Ordine pranzo" },
      { loyaltyCardId: marcoBarelioCard.id, type: "EARN", points: 70, balanceAfter: 150, description: "Ordine cena" },
    ],
  });

  // ─── Feedback with review flow fields ──────────────────────

  await prisma.merchantFeedback.createMany({
    data: [
      // Cafe feedback
      { merchantId: cafe.id, customerId: alice.id, rating: 5, text: "Great service and very clear reward rules.", source: "GOOGLE_MAPS" },
      { merchantId: cafe.id, customerId: bob.id, rating: 2, text: "Checkout was slow, points update took too long.", foodRating: 3, serviceRating: 1, atmosphereRating: 3, source: "DIRECT" },
      { merchantId: cafe.id, customerId: charlie.id, rating: 4, text: "Love the new loyalty program! Easy to earn points.", foodRating: 5, serviceRating: 4, atmosphereRating: 4, source: "DIRECT" },
      // Restaurant feedback
      { merchantId: restaurant.id, customerId: alice.id, rating: 4, text: "Good loyalty program and easy to redeem.", foodRating: 5, serviceRating: 3, atmosphereRating: 4, source: "DIRECT" },
      { merchantId: restaurant.id, customerId: diana.id, rating: 5, text: "Amazing experience!", source: "GOOGLE_MAPS" },
      // Barelio feedback
      { merchantId: barelio.id, customerId: bob.id, rating: 5, text: "Programma chiarissimo, premio riscattato in pochi secondi.", source: "GOOGLE_MAPS" },
      { merchantId: barelio.id, customerId: alice.id, rating: 3, text: "Esperienza buona, ma vorrei vedere più promemoria sui premi disponibili.", foodRating: 4, serviceRating: 2, atmosphereRating: 3, source: "DIRECT" },
      { merchantId: barelio.id, customerId: marco.id, rating: 4, text: "Ottimo locale, personale gentile.", foodRating: 4, serviceRating: 5, atmosphereRating: 4, source: "DIRECT" },
      // Anonymous feedback
      { merchantId: barelio.id, customerId: null, rating: 1, text: "Attesa troppo lunga.", foodRating: 2, serviceRating: 1, atmosphereRating: 3, source: "DIRECT" },
    ],
  });

  // ─── Prize wins (simulate some claimed prizes) ─────────────

  const cafePrizes = await prisma.prize.findMany({ where: { campaignId: cafeCampaign.id } });
  const barelioPrizes = await prisma.prize.findMany({ where: { campaignId: barelioCampaign.id } });

  await prisma.prizeWin.create({
    data: {
      campaignId: cafeCampaign.id,
      prizeId: cafePrizes[0].id,
      customerId: alice.id,
      loyaltyCardId: aliceCafeCard.id,
      redemptionCode: "CAFE-A1B2",
      status: "REDEEMED",
      redeemedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 86400000),
    },
  });

  await prisma.prizeWin.create({
    data: {
      campaignId: cafeCampaign.id,
      prizeId: cafePrizes[2].id,
      customerId: charlie.id,
      loyaltyCardId: charlieCafeCard.id,
      redemptionCode: "CAFE-C3D4",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 14 * 86400000),
    },
  });

  await prisma.prizeWin.create({
    data: {
      campaignId: barelioCampaign.id,
      prizeId: barelioPrizes[0].id,
      customerId: marco.id,
      loyaltyCardId: marcoBarelioCard.id,
      redemptionCode: "BAR-M5N6",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  console.log("\nSeed complete:");
  console.log(`  Merchants: ${cafe.name}, ${restaurant.name}, ${barelio.name}`);
  console.log(`  Login: any email above with password "password123"`);
  console.log(`  Customers: Alice, Bob, Charlie, Diana, Marco (7 loyalty cards)`);
  console.log(`  Campaigns: ${cafeCampaign.name}, ${barelioCampaign.name}, ${restaurantCampaign.name}`);
  console.log(`  Feedback: 9 entries (with detailed ratings + Google Maps sources)`);
  console.log(`  Prize wins: 3 (1 redeemed, 2 pending)`);
  console.log(`  Programs: Barelio has ${barelioProgram.rewardTiers.length} reward tiers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
