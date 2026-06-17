import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a secure random API key
 * Format: loy_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (prefix + 32 random bytes)
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const prefix = process.env.NODE_ENV === 'production' ? 'loy_live' : 'loy_test';
  return `${prefix}_${randomBytes}`;
}

/**
 * Hash an API key using bcrypt
 * @param apiKey - Plain text API key to hash
 * @returns Hashed API key
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(apiKey, saltRounds);
}

/**
 * Verify an API key against a hash
 * @param apiKey - Plain text API key
 * @param hash - Hashed API key from database
 * @returns True if the key matches the hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Extract merchant ID from old UUID-based API key format
 * For backward compatibility during migration
 */
export function isLegacyApiKey(apiKey: string): boolean {
  // Legacy keys are just UUIDs (36 chars with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(apiKey);
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // New format: loy_{live|test}_64chars
  const newFormatRegex = /^loy_(live|test)_[0-9a-f]{64}$/;

  // Also accept legacy UUID format during migration period
  const legacyFormatRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return newFormatRegex.test(apiKey) || legacyFormatRegex.test(apiKey);
}
