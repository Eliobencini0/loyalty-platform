#!/usr/bin/env node
/**
 * Automated Test Suite for Critical Security Fixes
 *
 * Tests:
 * 1. API Key Authentication (hashed keys)
 * 2. Points Race Condition (atomic operations)
 * 3. Rate Limiting (429 responses)
 * 4. Connection Pool (concurrent requests)
 *
 * Run: node --loader ts-node/esm test-critical-fixes.js
 * Or: node test-critical-fixes.js (uses dynamic import)
 */

const { execSync } = require('child_process');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function success(msg) { log(colors.green, '✓', msg); }
function error(msg) { log(colors.red, '✗', msg); }
function info(msg) { log(colors.cyan, 'ℹ', msg); }
function warn(msg) { log(colors.yellow, '⚠', msg); }

let passedTests = 0;
let failedTests = 0;
let testMerchantId = null;
let testApiKey = null;
let testCardId = null;

// ─── Test Helpers ────────────────────────────────────────────────

async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.text().then(text => {
      try { return JSON.parse(text); } catch { return text; }
    });

    return { status: response.status, data, headers: response.headers };
  } catch (err) {
    throw new Error(`Request failed: ${err.message}`);
  }
}

function assert(condition, message) {
  if (condition) {
    success(message);
    passedTests++;
  } else {
    error(message);
    failedTests++;
    throw new Error(message);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Test Suite ──────────────────────────────────────────────────

async function setup() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Critical Fixes Test Suite');
  console.log('='.repeat(60) + '\n');

  info(`Testing API at: ${BASE_URL}`);
  info('Checking if server is running...\n');

  try {
    const { status } = await apiRequest('/health');
    assert(status === 200, 'Server is running');
  } catch (err) {
    error('Server is not running. Start it with: npm run dev');
    process.exit(1);
  }

  // Create test data using TypeScript setup script
  info('Creating test merchant, customer, and card...');
  try {
    const output = execSync('npx ts-node test-setup.ts', { encoding: 'utf-8' });
    const testData = JSON.parse(output);

    testMerchantId = testData.merchantId;
    testCardId = testData.cardId;

    info(`Merchant ID: ${testMerchantId.substring(0, 8)}...`);
    info(`Card ID: ${testCardId.substring(0, 8)}...\n`);
  } catch (err) {
    error(`Failed to create test data: ${err.message}`);
    process.exit(1);
  }
}

// ─── Test 1: API Key Authentication ──────────────────────────────

async function testApiKeyAuthentication() {
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 1: Hashed API Key Authentication');
  console.log('─'.repeat(60) + '\n');

  // Test legacy UUID key (backward compatibility)
  info('Testing legacy UUID API key...');
  const legacy = await apiRequest('/api/merchants/me', {
    headers: { 'X-API-Key': testMerchantId },
  });
  assert(legacy.status === 200, 'Legacy UUID key still works (backward compatible)');

  // Generate new API key
  info('Generating new hashed API key...');
  const newKey = await apiRequest('/api/merchants/me/api-keys', {
    method: 'POST',
    headers: { 'X-API-Key': testMerchantId },
    body: JSON.stringify({ name: 'Test API Key' }),
  });

  assert(newKey.status === 201, 'New API key created');
  assert(newKey.data.apiKey.startsWith('loy_test_'), 'API key has correct format (loy_test_*)');
  assert(newKey.data.apiKey.length === 73, 'API key has correct length (73 chars)');

  testApiKey = newKey.data.apiKey;
  info(`Generated key: ${testApiKey.substring(0, 20)}...`);

  // Test authentication with new key
  info('Testing authentication with new API key...');
  const auth = await apiRequest('/api/merchants/me', {
    headers: { 'X-API-Key': testApiKey },
  });
  assert(auth.status === 200, 'New API key authenticates successfully');

  // List API keys
  info('Listing API keys...');
  const list = await apiRequest('/api/merchants/me/api-keys', {
    headers: { 'X-API-Key': testApiKey },
  });
  assert(list.status === 200, 'Can list API keys');
  assert(list.data.data.length >= 1, 'At least one API key exists');
  assert(!list.data.data[0].keyHash, 'keyHash is not exposed in API response');

  // Test invalid key
  info('Testing invalid API key...');
  const invalid = await apiRequest('/api/merchants/me', {
    headers: { 'X-API-Key': 'loy_test_invalid_key_123456' },
  });
  assert(invalid.status === 401, 'Invalid API key is rejected');

  success('✓ API Key Authentication: ALL TESTS PASSED\n');
}

// ─── Test 2: Points Race Condition ───────────────────────────────

async function testPointsRaceCondition() {
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 2: Points Transaction Race Condition');
  console.log('─'.repeat(60) + '\n');

  // Get initial balance
  const initial = await apiRequest(`/api/points/balance/${testCardId}`, {
    headers: { 'X-API-Key': testApiKey },
  });
  const initialBalance = initial.data.pointsBalance;
  info(`Initial balance: ${initialBalance} points`);

  // Simulate concurrent earn requests
  info('Simulating 10 concurrent earn requests (10 points each)...');
  const concurrentEarns = Array.from({ length: 10 }, () =>
    apiRequest('/api/points/earn', {
      method: 'POST',
      headers: { 'X-API-Key': testApiKey },
      body: JSON.stringify({
        loyaltyCardId: testCardId,
        points: 10,
        description: 'Concurrent test earn',
      }),
    })
  );

  const results = await Promise.all(concurrentEarns);
  const allSucceeded = results.every(r => r.status === 201);
  assert(allSucceeded, 'All concurrent earn requests succeeded');

  // Check final balance
  await sleep(500); // Wait for transactions to settle
  const final = await apiRequest(`/api/points/balance/${testCardId}`, {
    headers: { 'X-API-Key': testApiKey },
  });
  const finalBalance = final.data.pointsBalance;
  const expectedBalance = initialBalance + 100; // 10 requests × 10 points

  info(`Final balance: ${finalBalance} points`);
  info(`Expected balance: ${expectedBalance} points`);

  assert(
    finalBalance === expectedBalance,
    `✓ No race condition: ${finalBalance} === ${expectedBalance} (all 100 points counted)`
  );

  // Test concurrent redeem
  info('Testing concurrent redeem requests...');
  const concurrentRedeems = Array.from({ length: 5 }, () =>
    apiRequest('/api/points/redeem', {
      method: 'POST',
      headers: { 'X-API-Key': testApiKey },
      body: JSON.stringify({
        loyaltyCardId: testCardId,
        points: 5,
        description: 'Concurrent test redeem',
      }),
    })
  );

  const redeemResults = await Promise.all(concurrentRedeems);
  const allRedeemSucceeded = redeemResults.every(r => r.status === 201);
  assert(allRedeemSucceeded, 'All concurrent redeem requests succeeded');

  await sleep(500);
  const afterRedeem = await apiRequest(`/api/points/balance/${testCardId}`, {
    headers: { 'X-API-Key': testApiKey },
  });
  const expectedAfterRedeem = expectedBalance - 25; // 5 requests × 5 points
  assert(
    afterRedeem.data.pointsBalance === expectedAfterRedeem,
    `✓ Redeem race condition fixed: ${afterRedeem.data.pointsBalance} === ${expectedAfterRedeem}`
  );

  success('✓ Points Race Condition: ALL TESTS PASSED\n');
}

// ─── Test 3: Rate Limiting ───────────────────────────────────────

async function testRateLimiting() {
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 3: Rate Limiting');
  console.log('─'.repeat(60) + '\n');

  // Test login rate limit (5 req/min)
  info('Testing /auth/login rate limit (5 req/min)...');
  const loginRequests = Array.from({ length: 7 }, () =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong',
      }),
    })
  );

  const loginResults = await Promise.all(loginRequests);
  const rateLimitedLogins = loginResults.filter(r => r.status === 429);

  assert(
    rateLimitedLogins.length >= 2,
    `Rate limit triggered after 5 requests (${rateLimitedLogins.length} requests blocked)`
  );

  const rateLimitHeaders = rateLimitedLogins[0]?.headers;
  if (rateLimitHeaders) {
    info(`  RateLimit-Limit: ${rateLimitHeaders.get('ratelimit-limit')}`);
    info(`  RateLimit-Remaining: ${rateLimitHeaders.get('ratelimit-remaining')}`);
    info(`  Retry-After: ${rateLimitHeaders.get('retry-after')} seconds`);
  }

  // Wait for rate limit to reset
  info('Waiting 2 seconds for partial reset...');
  await sleep(2000);

  // Test feedback rate limit (10 req/min)
  info('Testing /feedback rate limit (10 req/min)...');
  const feedbackRequests = Array.from({ length: 12 }, () =>
    apiRequest(`/api/feedback/${testMerchantId}`, {
      method: 'POST',
      body: JSON.stringify({
        rating: 4,
        email: 'test@example.com',
        firstName: 'Test',
      }),
    })
  );

  const feedbackResults = await Promise.all(feedbackRequests);
  const rateLimitedFeedback = feedbackResults.filter(r => r.status === 429);

  assert(
    rateLimitedFeedback.length >= 2,
    `Feedback rate limit triggered (${rateLimitedFeedback.length} requests blocked)`
  );

  success('✓ Rate Limiting: ALL TESTS PASSED\n');
}

// ─── Test 4: Connection Pool ─────────────────────────────────────

async function testConnectionPool() {
  console.log('\n' + '─'.repeat(60));
  console.log('TEST 4: PostgreSQL Connection Pool');
  console.log('─'.repeat(60) + '\n');

  info('Testing connection pool with 20 concurrent requests...');

  const concurrentRequests = Array.from({ length: 20 }, (_, i) =>
    apiRequest(`/api/points/balance/${testCardId}`, {
      headers: { 'X-API-Key': testApiKey },
    }).then(r => ({ index: i, status: r.status }))
  );

  const startTime = Date.now();
  const poolResults = await Promise.all(concurrentRequests);
  const endTime = Date.now();

  const allPoolSucceeded = poolResults.every(r => r.status === 200);
  assert(allPoolSucceeded, 'All 20 concurrent requests succeeded (pool handled load)');

  const totalTime = endTime - startTime;
  info(`  Completed in ${totalTime}ms (avg ${Math.round(totalTime / 20)}ms per request)`);

  assert(totalTime < 5000, 'Pool handled requests efficiently (< 5 seconds total)');

  success('✓ Connection Pool: ALL TESTS PASSED\n');
}

// ─── Cleanup ─────────────────────────────────────────────────────

async function cleanup() {
  info('Cleaning up test data...');

  // Revoke test API key
  if (testApiKey) {
    const keys = await apiRequest('/api/merchants/me/api-keys', {
      headers: { 'X-API-Key': testApiKey },
    });

    for (const key of keys.data.data) {
      await apiRequest(`/api/merchants/me/api-keys/${key.id}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': testApiKey },
      });
    }
  }

  success('Test cleanup complete');
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  try {
    await setup();
    await testApiKeyAuthentication();
    await testPointsRaceCondition();
    await testRateLimiting();
    await testConnectionPool();
    await cleanup();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results');
    console.log('='.repeat(60));
    console.log(`${colors.green}✓ Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${failedTests}${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    if (failedTests === 0) {
      success('🎉 ALL TESTS PASSED! Code is ready for production.');
      process.exit(0);
    } else {
      error(`❌ ${failedTests} test(s) failed. Review errors above.`);
      process.exit(1);
    }
  } catch (err) {
    error(`Test suite crashed: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
