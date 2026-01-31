/**
 * Products Routes
 *
 * CRUD operations for product management.
 */

import type { Vexor, VexorContext } from '@vexorjs/core';
import { db } from '../../db/index.js';
import type { Product } from '../../db/schema.js';
import { requireAuth, requireAdmin, optionalAuth, getUserIdFromContext, getUserRoleFromContext } from '../auth/middleware.js';
import {
  ValidationError,
  NotFoundError,
} from '../../middleware/error-handler.js';
import {
  isNotEmpty,
  isNonNegativeNumber,
  parsePagination,
} from '../../utils/validation.js';

export function registerProductRoutes(app: Vexor): void {
  // ========================================================================
  // GET /products - List all products (public)
  // ========================================================================
  app.get('/products', {
    hooks: { preHandler: [optionalAuth()] }
  }, async (ctx: VexorContext) => {
    const { page, limit, offset } = parsePagination(ctx.query);
    const search = ctx.queryParam('search') as string | undefined;
    const category = ctx.queryParam('category') as string | undefined;
    const minPrice = ctx.queryParam('minPrice') as string | undefined;
    const maxPrice = ctx.queryParam('maxPrice') as string | undefined;
    const inStock = ctx.queryParam('inStock') as string | undefined;

    // Non-admins only see active products
    const isAdmin = getUserRoleFromContext(ctx) === 'admin';

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (!isAdmin) {
      query += ' AND is_active = 1';
      countQuery += ' AND is_active = 1';
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    if (category) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query += ' AND price >= ?';
        countQuery += ' AND price >= ?';
        params.push(min);
        countParams.push(min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query += ' AND price <= ?';
        countQuery += ' AND price <= ?';
        params.push(max);
        countParams.push(max);
      }
    }

    if (inStock === 'true') {
      query += ' AND stock > 0';
      countQuery += ' AND stock > 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [productsResult, countResult] = await Promise.all([
      db.query<Product>(query, params),
      db.query<{ count: number }>(countQuery, countParams),
    ]);

    const total = countResult.rows[0]?.count || 0;

    return ctx.json({
      data: productsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // ========================================================================
  // GET /products/categories - Get all categories
  // ========================================================================
  app.get('/products/categories', async (ctx: VexorContext) => {
    const result = await db.query<{ category: string; count: number }>(
      `SELECT category, COUNT(*) as count
       FROM products
       WHERE is_active = 1 AND category IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`
    );

    return ctx.json({ categories: result.rows });
  });

  // ========================================================================
  // GET /products/:id - Get product by ID (public)
  // ========================================================================
  app.get('/products/:id', {
    hooks: { preHandler: [optionalAuth()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid product ID');
    }

    const isAdmin = getUserRoleFromContext(ctx) === 'admin';

    let query = 'SELECT * FROM products WHERE id = ?';
    if (!isAdmin) {
      query += ' AND is_active = 1';
    }

    const result = await db.query<Product>(query, [id]);

    const product = result.rows[0];
    if (!product) {
      throw new NotFoundError('Product');
    }

    return ctx.json({ product });
  });

  // ========================================================================
  // POST /products - Create product (admin only)
  // ========================================================================
  app.post('/products', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const body = await ctx.readJson<{
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      category?: string;
    }>();

    // Validate input
    const errors: { field: string; message: string }[] = [];

    if (!isNotEmpty(body.name)) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (body.price === undefined || !isNonNegativeNumber(body.price)) {
      errors.push({ field: 'price', message: 'Valid price is required' });
    }

    if (body.stock !== undefined && !Number.isInteger(body.stock)) {
      errors.push({ field: 'stock', message: 'Stock must be an integer' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await db.query<{ id: number }>(
      `INSERT INTO products (name, description, price, stock, category, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       RETURNING id`,
      [
        body.name,
        body.description || null,
        body.price,
        body.stock || 0,
        body.category || null,
        getUserIdFromContext(ctx),
      ]
    );

    const productId = result.rows[0]?.id;

    // Fetch created product
    const productResult = await db.query<Product>(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    return ctx.status(201).json({
      message: 'Product created successfully',
      product: productResult.rows[0],
    });
  });

  // ========================================================================
  // PUT /products/:id - Update product (admin only)
  // ========================================================================
  app.put('/products/:id', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid product ID');
    }

    // Check product exists
    const existingResult = await db.query<Product>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!existingResult.rows[0]) {
      throw new NotFoundError('Product');
    }

    const body = await ctx.readJson<{
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      category?: string;
      isActive?: boolean;
    }>();

    const updates: string[] = [];
    const params: unknown[] = [];

    if (isNotEmpty(body.name)) {
      updates.push('name = ?');
      params.push(body.name);
    }

    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description || null);
    }

    if (body.price !== undefined) {
      if (!isNonNegativeNumber(body.price)) {
        throw new ValidationError('Invalid price');
      }
      updates.push('price = ?');
      params.push(body.price);
    }

    if (body.stock !== undefined) {
      if (!Number.isInteger(body.stock) || body.stock < 0) {
        throw new ValidationError('Stock must be a non-negative integer');
      }
      updates.push('stock = ?');
      params.push(body.stock);
    }

    if (body.category !== undefined) {
      updates.push('category = ?');
      params.push(body.category || null);
    }

    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(body.isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated product
    const updatedResult = await db.query<Product>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    return ctx.json({
      message: 'Product updated successfully',
      product: updatedResult.rows[0],
    });
  });

  // ========================================================================
  // DELETE /products/:id - Delete product (admin only)
  // ========================================================================
  app.delete('/products/:id', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid product ID');
    }

    const result = await db.query<Product>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!result.rows[0]) {
      throw new NotFoundError('Product');
    }

    // Soft delete - just deactivate
    await db.query(
      "UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
      [id]
    );

    return ctx.json({ message: 'Product deleted successfully' });
  });

  // ========================================================================
  // PATCH /products/:id/stock - Update stock (admin only)
  // ========================================================================
  app.patch('/products/:id/stock', {
    hooks: { preHandler: [requireAuth(), requireAdmin()] }
  }, async (ctx: VexorContext) => {
    const id = parseInt(ctx.params.id, 10);

    if (isNaN(id)) {
      throw new ValidationError('Invalid product ID');
    }

    const body = await ctx.readJson<{
      adjustment?: number;
      absolute?: number;
    }>();

    const result = await db.query<Product>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    const product = result.rows[0];
    if (!product) {
      throw new NotFoundError('Product');
    }

    let newStock: number;

    if (body.absolute !== undefined) {
      if (!Number.isInteger(body.absolute) || body.absolute < 0) {
        throw new ValidationError('Absolute stock must be a non-negative integer');
      }
      newStock = body.absolute;
    } else if (body.adjustment !== undefined) {
      if (!Number.isInteger(body.adjustment)) {
        throw new ValidationError('Adjustment must be an integer');
      }
      newStock = product.stock + body.adjustment;
      if (newStock < 0) {
        throw new ValidationError('Stock cannot be negative');
      }
    } else {
      throw new ValidationError('Either adjustment or absolute is required');
    }

    await db.query(
      "UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?",
      [newStock, id]
    );

    return ctx.json({
      message: 'Stock updated successfully',
      previousStock: product.stock,
      newStock,
    });
  });
}
