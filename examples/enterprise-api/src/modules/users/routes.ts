/**
 * Users Routes
 *
 * CRUD operations for user management (admin only for most operations).
 */

import type { Vexor, VexorContext } from '@vexorjs/core';
import { db } from '../../db/index.js';
import type { User, UserPublic } from '../../db/schema.js';
import { requireAuth, requireAdmin, getUserIdFromContext, getUserRoleFromContext } from '../auth/middleware.js';
import {
  ValidationError,
  NotFoundError,
} from '../../middleware/error-handler.js';
import {
  isValidEmail,
  isNotEmpty,
  parsePagination,
} from '../../utils/validation.js';

function sanitizeUser(user: User): UserPublic {
  const { password, ...publicUser } = user;
  return publicUser;
}

export function registerUserRoutes(app: Vexor): void {
  // ========================================================================
  // GET /users - List all users (admin only)
  // ========================================================================
  app.get('/users', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const { page, limit, offset } = parsePagination(ctx.query);
    const search = ctx.queryParam('search') as string | undefined;
    const role = ctx.queryParam('role') as string | undefined;
    const isActive = ctx.queryParam('isActive');

    let query = 'SELECT * FROM users WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    if (role) {
      query += ' AND role = ?';
      countQuery += ' AND role = ?';
      params.push(role);
      countParams.push(role);
    }

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      countQuery += ' AND is_active = ?';
      const active = isActive === 'true' ? 1 : 0;
      params.push(active);
      countParams.push(active);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      db.query<User>(query, params),
      db.query<{ count: number }>(countQuery, countParams),
    ]);

    const total = countResult.rows[0]?.count || 0;

    return ctx.json({
      data: usersResult.rows.map(sanitizeUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // ========================================================================
  // GET /users/:id - Get user by ID
  // ========================================================================
  app.get('/users/:id', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid user ID');
    }

    // Users can only view their own profile, admins can view anyone
    if (getUserRoleFromContext(ctx) !== 'admin' && getUserIdFromContext(ctx) !== id) {
      throw new NotFoundError('User');
    }

    const result = await db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError('User');
    }

    return ctx.json({ user: sanitizeUser(user) });
  });

  // ========================================================================
  // PUT /users/:id - Update user
  // ========================================================================
  app.put('/users/:id', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid user ID');
    }

    // Users can only update their own profile (limited fields), admins can update anyone
    const isAdmin = getUserRoleFromContext(ctx) === 'admin';
    const isSelf = getUserIdFromContext(ctx) === id;

    if (!isAdmin && !isSelf) {
      throw new NotFoundError('User');
    }

    // Check user exists
    const existingResult = await db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!existingResult.rows[0]) {
      throw new NotFoundError('User');
    }

    const body = await ctx.readJson<{
      name?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
    }>();

    const updates: string[] = [];
    const params: unknown[] = [];

    // Name can be updated by anyone
    if (isNotEmpty(body.name)) {
      updates.push('name = ?');
      params.push(body.name);
    }

    // Email can be updated by anyone
    if (isNotEmpty(body.email)) {
      if (!isValidEmail(body.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Check email uniqueness
      const emailCheck = await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE email = ? AND id != ?',
        [body.email.toLowerCase(), id]
      );

      if (emailCheck.rows[0]?.count > 0) {
        throw new ValidationError('Email already in use');
      }

      updates.push('email = ?');
      params.push(body.email.toLowerCase());
    }

    // Role and isActive can only be updated by admins
    if (isAdmin) {
      if (body.role && ['admin', 'user'].includes(body.role)) {
        updates.push('role = ?');
        params.push(body.role);
      }

      if (body.isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(body.isActive ? 1 : 0);
      }
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated user
    const updatedResult = await db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return ctx.json({
      message: 'User updated successfully',
      user: sanitizeUser(updatedResult.rows[0]!),
    });
  });

  // ========================================================================
  // DELETE /users/:id - Delete user (admin only)
  // ========================================================================
  app.delete('/users/:id', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid user ID');
    }

    // Prevent self-deletion
    if (getUserIdFromContext(ctx) === id) {
      throw new ValidationError('Cannot delete your own account');
    }

    const result = await db.query<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!result.rows[0]) {
      throw new NotFoundError('User');
    }

    // Soft delete - just deactivate
    await db.query(
      "UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
      [id]
    );

    return ctx.json({ message: 'User deleted successfully' });
  });

  // ========================================================================
  // GET /users/:id/orders - Get user orders
  // ========================================================================
  app.get('/users/:id/orders', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid user ID');
    }

    // Users can only view their own orders, admins can view anyone
    if (getUserRoleFromContext(ctx) !== 'admin' && getUserIdFromContext(ctx) !== id) {
      throw new NotFoundError('User');
    }

    const { page, limit, offset } = parsePagination(ctx.query);

    const [ordersResult, countResult] = await Promise.all([
      db.query<{
        id: number;
        status: string;
        total_amount: number;
        created_at: string;
      }>(
        `SELECT id, status, total_amount, created_at
         FROM orders
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [id, limit, offset]
      ),
      db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
        [id]
      ),
    ]);

    const total = countResult.rows[0]?.count || 0;

    return ctx.json({
      data: ordersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}
