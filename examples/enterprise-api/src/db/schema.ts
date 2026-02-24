/**
 * Database Schema Definitions
 *
 * Type-safe table definitions using @vexorjs/orm
 */

import { table, column } from '@vexorjs/orm';

// ============================================================================
// Users Table
// ============================================================================

export const users = table('users', {
  id: column.integer().primaryKey(),
  email: column.varchar(255).notNull().unique(),
  password: column.varchar(255).notNull(),
  name: column.varchar(255).notNull(),
  role: column.varchar(50).notNull().default('user'),
  isActive: column.boolean().notNull().default(true),
  lastLoginAt: column.timestamp(),
  createdAt: column.timestamp().notNull().defaultNow(),
  updatedAt: column.timestamp().notNull().defaultNow(),
});

export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPublic = Omit<User, 'password'>;

export type CreateUser = {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'user';
};

export type UpdateUser = Partial<Omit<CreateUser, 'password'>> & {
  isActive?: boolean;
};

// ============================================================================
// Refresh Tokens Table
// ============================================================================

export const refreshTokens = table('refresh_tokens', {
  id: column.integer().primaryKey(),
  userId: column.integer().notNull().references(() => ({ table: 'users', column: 'id' })),
  token: column.varchar(255).notNull().unique(),
  expiresAt: column.timestamp().notNull(),
  createdAt: column.timestamp().notNull().defaultNow(),
});

export type RefreshToken = {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

// ============================================================================
// Products Table
// ============================================================================

export const products = table('products', {
  id: column.integer().primaryKey(),
  name: column.varchar(255).notNull(),
  description: column.text(),
  price: column.decimal(10, 2).notNull(),
  stock: column.integer().notNull().default(0),
  category: column.varchar(100),
  isActive: column.boolean().notNull().default(true),
  createdBy: column.integer().references(() => ({ table: 'users', column: 'id' })),
  createdAt: column.timestamp().notNull().defaultNow(),
  updatedAt: column.timestamp().notNull().defaultNow(),
});

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  isActive: boolean;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProduct = {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
};

export type UpdateProduct = Partial<CreateProduct> & {
  isActive?: boolean;
};

// ============================================================================
// Orders Table
// ============================================================================

export const orders = table('orders', {
  id: column.integer().primaryKey(),
  userId: column.integer().notNull().references(() => ({ table: 'users', column: 'id' })),
  status: column.varchar(50).notNull().default('pending'),
  totalAmount: column.decimal(10, 2).notNull(),
  shippingAddress: column.text(),
  notes: column.text(),
  createdAt: column.timestamp().notNull().defaultNow(),
  updatedAt: column.timestamp().notNull().defaultNow(),
});

export type Order = {
  id: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Order Items Table
// ============================================================================

export const orderItems = table('order_items', {
  id: column.integer().primaryKey(),
  orderId: column.integer().notNull().references(() => ({ table: 'orders', column: 'id' })),
  productId: column.integer().notNull().references(() => ({ table: 'products', column: 'id' })),
  quantity: column.integer().notNull(),
  unitPrice: column.decimal(10, 2).notNull(),
  createdAt: column.timestamp().notNull().defaultNow(),
});

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
};

// ============================================================================
// Audit Log Table
// ============================================================================

export const auditLogs = table('audit_logs', {
  id: column.integer().primaryKey(),
  userId: column.integer().references(() => ({ table: 'users', column: 'id' })),
  action: column.varchar(100).notNull(),
  resource: column.varchar(100).notNull(),
  resourceId: column.varchar(100),
  details: column.text(),
  ipAddress: column.varchar(45),
  userAgent: column.text(),
  createdAt: column.timestamp().notNull().defaultNow(),
});

export type AuditLog = {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};
