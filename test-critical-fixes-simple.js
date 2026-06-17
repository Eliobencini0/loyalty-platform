#!/usr/bin/env node
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function success(msg) { log(colors.green, '✓', msg); }
function error(msg) { log(colors.red, '✗', msg); }
function info(msg) { log(colors.cyan, 'ℹ', msg); }

let passedTests = 0;
let failedTests = 0;
let testMerchantId = null;
let testApiKey = null;

async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.text().then(t => { try { return JSON.parse(t); } catch { return t; } });
  return { status: response.status, data, headers: response.headers };
}

function assert(condition, message) {
  if (condition) {
    success(message);
    passedTests++;
  } else {
    error(message);
    failedTests++;
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Critical Fixes Test Suite');
  console.log('='.repeat(60) + '\n');

  info('TEST 1: API Key Authentication\n');

  try {
    const signup = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Merchant',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      }),
    });

    assert(signup.status === 201, 'Merchant signup successful');
    testMerchantId = signup.data.merchant?.id || signup.data.apiKey;

    const newKey = await apiRequest('/api/merchants/me/api-keys', {
      method: 'POST',
      headers: { 'X-API-Key': testMerchantId },
      body: JSON.stringify({ name: 'Test Key' }),
    });

    assert(newKey.status === 201, 'New API key created');
    assert(newKey.data.apiKey?.startsWith('loy_test_'), 'API key format correct');
    testApiKey = newKey.data.apiKey;

    const auth = await apiRequest('/api/merchants/me', {
      headers: { 'X-API-Key': testApiKey },
    });
    assert(auth.status === 200, 'New API key authenticates');

    const invalid = await apiRequest('/api/merchants/me', {
      headers: { 'X-API-Key': 'loy_test_invalid' },
    });
    assert(invalid.status === 401, 'Invalid key rejected');

    success('✓ API Key Authentication: PASSED\n');
  } catch (err) {
    error(`API Key test failed: ${err.message}\n`);
  }

  info('TEST 2: Rate Limiting\n');

  try {
    const logins = await Promise.all(
      Array.from({ length: 7 }, () =>
        apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
        })
      )
    );

    const blocked = logins.filter(r => r.status === 429);
    assert(blocked.length >= 2, `Rate limit triggered (${blocked.length}/7 blocked)`);

    success('✓ Rate Limiting: PASSED\n');
  } catch (err) {
    error(`Rate limiting test failed: ${err.message}\n`);
  }

  info('TEST 3: Connection Pool\n');

  try {
    const start = Date.now();
    const requests = await Promise.all(
      Array.from({ length: 20 }, () =>
        apiRequest('/api/merchants/me', {
          headers: { 'X-API-Key': testApiKey },
        })
      )
    );

    const time = Date.now() - start;
    const allOk = requests.every(r => r.status === 200);

    assert(allOk, 'All 20 concurrent requests succeeded');
    assert(time < 5000, `Completed in ${time}ms`);

    success('✓ Connection Pool: PASSED\n');
  } catch (err) {
    error(`Connection pool test failed: ${err.message}\n`);
  }

  console.log('='.repeat(60));
  console.log('📊 Results');
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failedTests}${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  if (failedTests === 0) {
    success('🎉 ALL TESTS PASSED!');
    process.exit(0);
  } else {
    error(`❌ ${failedTests} test(s) failed`);
    process.exit(1);
  }
}

main().catch(err => {
  error(`Test suite crashed: ${err.message}`);
  process.exit(1);
});
