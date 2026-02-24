/**
 * Password Hashing Utilities
 *
 * Secure password hashing using PBKDF2 with timing-safe comparison.
 * Uses Node.js crypto module - no external dependencies.
 */

import { randomBytes, pbkdf2, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

// Configuration
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

/**
 * Hash a password securely
 *
 * @param password - Plain text password
 * @returns Hashed password in format: salt:iterations:hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return [
    salt.toString('hex'),
    ITERATIONS.toString(),
    hash.toString('hex')
  ].join(':');
}

/**
 * Verify a password against a stored hash
 *
 * @param password - Plain text password to verify
 * @param storedHash - Previously hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 3) {
      return false;
    }

    const [saltHex, iterationsStr, hashHex] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iterations = parseInt(iterationsStr, 10);
    const storedHashBuffer = Buffer.from(hashHex, 'hex');

    if (isNaN(iterations) || iterations < 1) {
      return false;
    }

    const hash = await pbkdf2Async(password, salt, iterations, storedHashBuffer.length, DIGEST);

    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(hash, storedHashBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate a random token (for password reset, email verification, etc.)
 *
 * @param length - Length of the token in bytes (output will be 2x in hex)
 * @returns Random hex token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a secure random string for API keys
 *
 * @param prefix - Optional prefix for the key
 * @returns API key in format: prefix_randomstring
 */
export function generateApiKey(prefix: string = 'vxr'): string {
  const randomPart = randomBytes(24).toString('base64url');
  return `${prefix}_${randomPart}`;
}
