/**
 * Authentication Middleware
 *
 * Protects routes and validates JWT tokens.
 * Works with Vexor's hook pattern (no next() function).
 */

import type { VexorContext } from '@vexorjs/core';
import { verifyAccessToken, getUserById } from './service.js';
import {
  AuthenticationError,
  AuthorizationError,
} from '../../middleware/error-handler.js';

// Extend VexorContext with auth properties
declare module '@vexorjs/core' {
  interface VexorContext {
    userId?: number;
    userEmail?: string;
    userRole?: string;
    user?: Awaited<ReturnType<typeof getUserById>>;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(ctx: VexorContext): string | null {
  const authHeader = ctx.header('authorization');
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) return null;

  return token;
}

/**
 * Get userId from context (checks both direct property and state)
 */
export function getUserIdFromContext(ctx: VexorContext): number | undefined {
  return ctx.userId ?? ctx.get<number>('userId');
}

/**
 * Get userRole from context (checks both direct property and state)
 */
export function getUserRoleFromContext(ctx: VexorContext): string | undefined {
  return ctx.userRole ?? ctx.get<string>('userRole');
}

/**
 * Require authentication middleware
 *
 * Validates JWT token and attaches user info to context.
 * Throws AuthenticationError if token is missing or invalid.
 */
export function requireAuth() {
  return async (ctx: VexorContext): Promise<void> => {
    const token = extractToken(ctx);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    try {
      const payload = await verifyAccessToken(token);

      // Attach user info to context using set() for proper persistence
      ctx.set('userId', payload.userId);
      ctx.set('userEmail', payload.email);
      ctx.set('userRole', payload.role);

      // Also set directly for convenience
      ctx.userId = payload.userId;
      ctx.userEmail = payload.email;
      ctx.userRole = payload.role;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid authentication token');
    }
  };
}

/**
 * Optional authentication middleware
 *
 * Validates JWT token if present, but doesn't require it.
 * Silently ignores invalid tokens.
 */
export function optionalAuth() {
  return async (ctx: VexorContext): Promise<void> => {
    const token = extractToken(ctx);

    if (token) {
      try {
        const payload = await verifyAccessToken(token);
        ctx.set('userId', payload.userId);
        ctx.set('userEmail', payload.email);
        ctx.set('userRole', payload.role);
        ctx.userId = payload.userId;
        ctx.userEmail = payload.email;
        ctx.userRole = payload.role;
      } catch {
        // Token is invalid, but that's okay for optional auth
      }
    }
  };
}

/**
 * Require specific role(s) middleware
 *
 * Must be used after requireAuth().
 */
export function requireRole(...roles: string[]) {
  return async (ctx: VexorContext): Promise<void> => {
    const userId = getUserIdFromContext(ctx);
    const userRole = getUserRoleFromContext(ctx);

    if (!userId) {
      throw new AuthenticationError('Authentication required');
    }

    if (!userRole || !roles.includes(userRole)) {
      throw new AuthorizationError(
        `This action requires one of these roles: ${roles.join(', ')}`
      );
    }
  };
}

/**
 * Require admin role middleware
 *
 * Shorthand for requireRole('admin').
 */
export function requireAdmin() {
  return requireRole('admin');
}

/**
 * Load full user object into context
 *
 * Use this when you need the full user object, not just the JWT payload.
 */
export function loadUser() {
  return async (ctx: VexorContext): Promise<void> => {
    const userId = getUserIdFromContext(ctx);
    if (userId) {
      ctx.user = await getUserById(userId);
    }
  };
}

/**
 * Require resource ownership or admin role
 *
 * Checks if the authenticated user owns the resource or is an admin.
 */
export function requireOwnershipOrAdmin(getOwnerId: (ctx: VexorContext) => number | Promise<number>) {
  return async (ctx: VexorContext): Promise<void> => {
    const userId = getUserIdFromContext(ctx);
    const userRole = getUserRoleFromContext(ctx);

    if (!userId) {
      throw new AuthenticationError('Authentication required');
    }

    // Admins can access any resource
    if (userRole === 'admin') {
      return;
    }

    const ownerId = await getOwnerId(ctx);

    if (ownerId !== userId) {
      throw new AuthorizationError('You do not have permission to access this resource');
    }
  };
}
