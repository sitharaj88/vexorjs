/**
 * Authentication Service
 *
 * Handles user authentication, JWT token management, and sessions.
 */

import { JWT } from '@vexorjs/core';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { hashPassword, verifyPassword, generateToken } from '../../utils/password.js';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../../middleware/error-handler.js';
import type { User, UserPublic } from '../../db/schema.js';

// Initialize JWT
const jwt = new JWT({ secret: config.jwtSecret });

// ============================================================================
// Types
// ============================================================================

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 3600; // Default 1 hour

  const num = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 3600;
    case 'd': return num * 86400;
    default: return 3600;
  }
}

function sanitizeUser(user: User): UserPublic {
  const { password, ...publicUser } = user;
  return publicUser;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  // Check if email already exists
  const existingResult = await db.query<{ count: number }>(
    'SELECT COUNT(*) as count FROM users WHERE email = ?',
    [input.email.toLowerCase()]
  );

  if (existingResult.rows[0]?.count > 0) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(input.password);

  // Insert user
  const result = await db.query<{ id: number }>(
    `INSERT INTO users (email, password, name, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, 'user', 1, datetime('now'), datetime('now'))
     RETURNING id`,
    [input.email.toLowerCase(), hashedPassword, input.name]
  );

  const userId = result.rows[0]?.id;
  if (!userId) {
    throw new Error('Failed to create user');
  }

  // Fetch created user
  const userResult = await db.query<User>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new Error('Failed to fetch created user');
  }

  // Generate tokens
  const tokens = await generateTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

/**
 * Login user with email and password
 */
export async function login(input: LoginInput): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  // Find user by email
  const result = await db.query<User>(
    'SELECT * FROM users WHERE email = ? AND is_active = 1',
    [input.email.toLowerCase()]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isValid = await verifyPassword(input.password, user.password);
  if (!isValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Update last login
  await db.query(
    "UPDATE users SET last_login_at = datetime('now') WHERE id = ?",
    [user.id]
  );

  // Generate tokens
  const tokens = await generateTokens(user);

  return {
    user: sanitizeUser(user),
    tokens,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  // Find refresh token
  const tokenResult = await db.query<{ id: number; user_id: number; expires_at: string }>(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')",
    [refreshToken]
  );

  const tokenRecord = tokenResult.rows[0];
  if (!tokenRecord) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  // Find user
  const userResult = await db.query<User>(
    'SELECT * FROM users WHERE id = ? AND is_active = 1',
    [tokenRecord.user_id]
  );

  const user = userResult.rows[0];
  if (!user) {
    throw new AuthenticationError('User not found or inactive');
  }

  // Delete old refresh token
  await db.query('DELETE FROM refresh_tokens WHERE id = ?', [tokenRecord.id]);

  // Generate new tokens
  return generateTokens(user);
}

/**
 * Logout user (invalidate refresh token)
 */
export async function logout(refreshToken: string): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
}

/**
 * Logout from all devices (invalidate all refresh tokens)
 */
export async function logoutAll(userId: number): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

/**
 * Verify access token and return payload
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  try {
    const result = await jwt.verify(token);
    // Extract our custom claims from the verified JWT payload
    const payload = result.payload as unknown as JWTPayload;
    return payload;
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<UserPublic | null> {
  const result = await db.query<User>(
    'SELECT * FROM users WHERE id = ? AND is_active = 1',
    [userId]
  );

  const user = result.rows[0];
  return user ? sanitizeUser(user) : null;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Get user with password
  const result = await db.query<User>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new ValidationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await db.query(
    "UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?",
    [hashedPassword, userId]
  );

  // Invalidate all refresh tokens
  await logoutAll(userId);
}

// ============================================================================
// Internal Functions
// ============================================================================

async function generateTokens(user: User): Promise<AuthTokens> {
  const expiresIn = parseExpiresIn(config.jwtExpiresIn);
  const now = Math.floor(Date.now() / 1000);

  // JWT payload with standard exp claim
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: now + expiresIn,
  };

  // Generate access token
  const accessToken = await jwt.sign(payload);

  // Generate refresh token
  const refreshToken = generateToken(32);
  const refreshExpiresIn = parseExpiresIn(config.jwtRefreshExpiresIn);

  // Store refresh token
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
     VALUES (?, ?, datetime('now', '+${refreshExpiresIn} seconds'), datetime('now'))`,
    [user.id, refreshToken]
  );

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}
