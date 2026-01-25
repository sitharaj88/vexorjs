/**
 * E-Commerce API Example
 *
 * Demonstrates Vexor's full-stack features:
 * - Authentication & Authorization
 * - Pagination & Filtering
 * - CRUD operations
 *
 * Run with: npx tsx examples/ecommerce-api/index.ts
 */

import { Vexor, VexorContext } from '../../packages/vexor/src/index.js';
import { JWT } from '../../packages/vexor/src/auth/jwt.js';

// ============================================================================
// Simple Validation Helpers
// ============================================================================

interface ValidationResult<T> {
  valid: boolean;
  value: T;
  errors?: string[];
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function validateRegister(data: unknown): ValidationResult<{ email: string; password: string; name: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { email: '', password: '', name: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.email) || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!isString(data.password) || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!isString(data.name) || data.name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (errors.length > 0) {
    return { valid: false, value: { email: '', password: '', name: '' }, errors };
  }
  return { valid: true, value: { email: data.email as string, password: data.password as string, name: data.name as string } };
}

function validateLogin(data: unknown): ValidationResult<{ email: string; password: string }> {
  if (!isObject(data)) {
    return { valid: false, value: { email: '', password: '' }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.email) || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!isString(data.password) || data.password.length < 1) {
    errors.push('Password is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { email: '', password: '' }, errors };
  }
  return { valid: true, value: { email: data.email as string, password: data.password as string } };
}

function validateProductCreate(data: unknown): ValidationResult<{
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock?: number;
  categoryId?: number;
}> {
  if (!isObject(data)) {
    return { valid: false, value: { name: '', price: 0 }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isString(data.name) || data.name.length < 1) {
    errors.push('Name is required');
  }
  if (!isNumber(data.price) || data.price < 0) {
    errors.push('Valid price is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { name: '', price: 0 }, errors };
  }
  return {
    valid: true,
    value: {
      name: data.name as string,
      description: isString(data.description) ? data.description : undefined,
      price: data.price as number,
      compareAtPrice: isNumber(data.compareAtPrice) ? data.compareAtPrice : undefined,
      sku: isString(data.sku) ? data.sku : undefined,
      stock: isNumber(data.stock) ? data.stock : undefined,
      categoryId: isNumber(data.categoryId) ? data.categoryId : undefined,
    },
  };
}

function validateAddToCart(data: unknown): ValidationResult<{ productId: number; quantity: number }> {
  if (!isObject(data)) {
    return { valid: false, value: { productId: 0, quantity: 1 }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isNumber(data.productId)) {
    errors.push('productId is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { productId: 0, quantity: 1 }, errors };
  }
  return {
    valid: true,
    value: {
      productId: data.productId as number,
      quantity: isNumber(data.quantity) && data.quantity >= 1 ? data.quantity : 1,
    },
  };
}

function validateUpdateCart(data: unknown): ValidationResult<{ quantity: number }> {
  if (!isObject(data)) {
    return { valid: false, value: { quantity: 0 }, errors: ['Invalid body'] };
  }
  if (!isNumber(data.quantity) || data.quantity < 0) {
    return { valid: false, value: { quantity: 0 }, errors: ['Valid quantity is required'] };
  }
  return { valid: true, value: { quantity: data.quantity } };
}

function validateCreateOrder(data: unknown): ValidationResult<{
  shippingAddress: { street: string; city: string; state: string; zip: string; country: string };
  notes?: string;
}> {
  if (!isObject(data)) {
    return { valid: false, value: { shippingAddress: { street: '', city: '', state: '', zip: '', country: '' } }, errors: ['Invalid body'] };
  }
  const errors: string[] = [];
  if (!isObject(data.shippingAddress)) {
    errors.push('shippingAddress is required');
  } else {
    const addr = data.shippingAddress;
    if (!isString(addr.street)) errors.push('street is required');
    if (!isString(addr.city)) errors.push('city is required');
    if (!isString(addr.state)) errors.push('state is required');
    if (!isString(addr.zip)) errors.push('zip is required');
    if (!isString(addr.country)) errors.push('country is required');
  }
  if (errors.length > 0) {
    return { valid: false, value: { shippingAddress: { street: '', city: '', state: '', zip: '', country: '' } }, errors };
  }
  const addr = data.shippingAddress as Record<string, unknown>;
  return {
    valid: true,
    value: {
      shippingAddress: {
        street: addr.street as string,
        city: addr.city as string,
        state: addr.state as string,
        zip: addr.zip as string,
        country: addr.country as string,
      },
      notes: isString(data.notes) ? data.notes : undefined,
    },
  };
}

function validateUpdateOrderStatus(data: unknown): ValidationResult<{ status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }> {
  if (!isObject(data)) {
    return { valid: false, value: { status: 'confirmed' }, errors: ['Invalid body'] };
  }
  const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!isString(data.status) || !validStatuses.includes(data.status)) {
    return { valid: false, value: { status: 'confirmed' }, errors: ['Invalid status'] };
  }
  return { valid: true, value: { status: data.status as 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' } };
}

// ============================================================================
// In-Memory Database Simulation
// ============================================================================

interface DBUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

interface DBCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
}

interface DBProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  categoryId: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DBOrder {
  id: number;
  userId: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Record<string, unknown> | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DBOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface DBCartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
}

// Sample data
const db = {
  users: new Map<number, DBUser>([
    [1, { id: 1, email: 'admin@shop.com', password: 'admin123', name: 'Admin User', role: 'admin', createdAt: new Date(), updatedAt: new Date() }],
    [2, { id: 2, email: 'customer@example.com', password: 'customer123', name: 'John Customer', role: 'customer', createdAt: new Date(), updatedAt: new Date() }],
  ]),
  categories: new Map<number, DBCategory>([
    [1, { id: 1, name: 'Electronics', slug: 'electronics', description: 'Electronic devices', parentId: null }],
    [2, { id: 2, name: 'Phones', slug: 'phones', description: 'Mobile phones', parentId: 1 }],
    [3, { id: 3, name: 'Laptops', slug: 'laptops', description: 'Laptop computers', parentId: 1 }],
    [4, { id: 4, name: 'Clothing', slug: 'clothing', description: 'Fashion items', parentId: null }],
  ]),
  products: new Map<number, DBProduct>([
    [1, { id: 1, name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'Latest iPhone', price: 999.99, compareAtPrice: 1099.99, sku: 'IPH15P-001', stock: 50, categoryId: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    [2, { id: 2, name: 'MacBook Pro 14"', slug: 'macbook-pro-14', description: 'Powerful laptop', price: 1999.99, compareAtPrice: null, sku: 'MBP14-001', stock: 25, categoryId: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    [3, { id: 3, name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', description: 'Android flagship', price: 899.99, compareAtPrice: 949.99, sku: 'SGS24-001', stock: 100, categoryId: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
    [4, { id: 4, name: 'ThinkPad X1 Carbon', slug: 'thinkpad-x1-carbon', description: 'Business laptop', price: 1499.99, compareAtPrice: null, sku: 'TPX1C-001', stock: 30, categoryId: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() }],
  ]),
  orders: new Map<number, DBOrder>(),
  orderItems: new Map<number, DBOrderItem>(),
  cartItems: new Map<number, DBCartItem>(),
  nextId: {
    users: 3,
    categories: 5,
    products: 5,
    orders: 1,
    orderItems: 1,
    cartItems: 1,
  },
};

// ============================================================================
// App Setup
// ============================================================================

const app = new Vexor({
  port: 3002,
  logging: true,
});

const jwt = new JWT({
  secret: 'ecommerce-secret-key-change-in-production',
  expiresIn: '7d',
});

// ============================================================================
// Middleware
// ============================================================================

async function authMiddleware(ctx: VexorContext): Promise<Response | void> {
  const token = ctx.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    return ctx.status(401).json({ error: 'Authentication required' });
  }

  try {
    const result = await jwt.verify(token);
    ctx.set('user', result.payload);
  } catch {
    return ctx.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function adminMiddleware(ctx: VexorContext): Promise<Response | void> {
  const user = ctx.get('user') as { userId: number; role: string } | undefined;

  if (!user || user.role !== 'admin') {
    return ctx.status(403).json({ error: 'Admin access required' });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function paginate<T>(items: T[], page: number, limit: number): { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    meta: { page, limit, total, totalPages },
  };
}

function getQueryParam(ctx: VexorContext, name: string): string | undefined {
  const value = ctx.queryParam(name);
  return Array.isArray(value) ? value[0] : value;
}

// ============================================================================
// Routes
// ============================================================================

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      products: db.products.size,
      users: db.users.size,
      orders: db.orders.size,
    },
  });
});

// Root
app.get('/', (ctx) => {
  return ctx.json({
    name: 'Vexor E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'GET /auth/me'],
      products: ['GET /products', 'GET /products/:slug', 'POST /products (admin)', 'PUT /products/:id (admin)', 'DELETE /products/:id (admin)'],
      categories: ['GET /categories', 'GET /categories/:slug'],
      cart: ['GET /cart', 'POST /cart', 'PUT /cart/:id', 'DELETE /cart/:id'],
      orders: ['GET /orders', 'POST /orders', 'GET /orders/:id', 'PUT /orders/:id/status (admin)'],
    },
  });
});

// ============================================================================
// Auth Routes
// ============================================================================

app.group('/auth', (auth) => {
  auth.post('/register', async (ctx) => {
    const body = await ctx.readJson();
    const result = validateRegister(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { email, password, name } = result.value;

    // Check if email exists
    const existing = Array.from(db.users.values()).find(u => u.email === email);
    if (existing) {
      return ctx.status(409).json({ error: 'Email already registered' });
    }

    const id = db.nextId.users++;
    const user: DBUser = {
      id,
      email,
      password,
      name,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users.set(id, user);

    const token = await jwt.sign({ userId: id, email, role: 'customer' });

    return ctx.status(201).json({
      user: { id, email, name, role: 'customer' },
      token,
    });
  });

  auth.post('/login', async (ctx) => {
    const body = await ctx.readJson();
    const result = validateLogin(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { email, password } = result.value;
    const user = Array.from(db.users.values()).find(u => u.email === email && u.password === password);

    if (!user) {
      return ctx.status(401).json({ error: 'Invalid credentials' });
    }

    const token = await jwt.sign({ userId: user.id, email: user.email, role: user.role });

    return ctx.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    });
  });

  auth.get('/me', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const payload = ctx.get('user') as { userId: number };
    const user = db.users.get(payload.userId);

    if (!user) {
      return ctx.notFound('User not found');
    }

    return ctx.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  });
});

// ============================================================================
// Category Routes
// ============================================================================

app.group('/categories', (categoriesApi) => {
  categoriesApi.get('/', (ctx) => {
    const allCategories = Array.from(db.categories.values());
    const parentId = getQueryParam(ctx, 'parentId');

    let filtered = allCategories;
    if (parentId === 'null') {
      filtered = allCategories.filter(c => c.parentId === null);
    } else if (parentId) {
      filtered = allCategories.filter(c => c.parentId === parseInt(parentId));
    }

    return ctx.json({ categories: filtered });
  });

  categoriesApi.get('/:slug', (ctx) => {
    const category = Array.from(db.categories.values()).find(c => c.slug === ctx.params.slug);

    if (!category) {
      return ctx.notFound('Category not found');
    }

    const subcategories = Array.from(db.categories.values()).filter(c => c.parentId === category.id);
    const categoryProducts = Array.from(db.products.values())
      .filter(p => p.categoryId === category.id && p.isActive)
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
      }));

    return ctx.json({
      ...category,
      subcategories,
      products: categoryProducts,
    });
  });
});

// ============================================================================
// Product Routes
// ============================================================================

app.group('/products', (productsApi) => {
  productsApi.get('/', (ctx) => {
    const page = parseInt(getQueryParam(ctx, 'page') || '1');
    const limit = parseInt(getQueryParam(ctx, 'limit') || '20');
    const categoryId = getQueryParam(ctx, 'categoryId');
    const search = getQueryParam(ctx, 'search');
    const minPrice = getQueryParam(ctx, 'minPrice');
    const maxPrice = getQueryParam(ctx, 'maxPrice');
    const sortBy = getQueryParam(ctx, 'sortBy') || 'createdAt';
    const sortOrder = getQueryParam(ctx, 'sortOrder') || 'desc';
    const inStock = getQueryParam(ctx, 'inStock');

    let filtered = Array.from(db.products.values()).filter(p => p.isActive);

    if (categoryId) {
      filtered = filtered.filter(p => p.categoryId === parseInt(categoryId));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (inStock === 'true') {
      filtered = filtered.filter(p => p.stock > 0);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof DBProduct];
      const bVal = b[sortBy as keyof DBProduct];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      return 0;
    });

    const result = paginate(filtered.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      categoryId: p.categoryId,
    })), page, limit);

    return ctx.json(result);
  });

  productsApi.get('/:slug', (ctx) => {
    const product = Array.from(db.products.values()).find(
      p => p.slug === ctx.params.slug || String(p.id) === ctx.params.slug
    );

    if (!product || !product.isActive) {
      return ctx.notFound('Product not found');
    }

    const category = product.categoryId ? db.categories.get(product.categoryId) : null;
    const related = Array.from(db.products.values())
      .filter(p => p.id !== product.id && p.categoryId === product.categoryId && p.isActive)
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
      }));

    return ctx.json({
      ...product,
      category,
      relatedProducts: related,
    });
  });

  productsApi.post('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;
    const adminResult = await adminMiddleware(ctx);
    if (adminResult) return adminResult;

    const body = await ctx.readJson();
    const result = validateProductCreate(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const data = result.value;
    const id = db.nextId.products++;
    const slug = slugify(data.name);

    if (Array.from(db.products.values()).some(p => p.slug === slug)) {
      return ctx.status(409).json({ error: 'Product with similar name already exists' });
    }

    const product: DBProduct = {
      id,
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      compareAtPrice: data.compareAtPrice || null,
      sku: data.sku || null,
      stock: data.stock || 0,
      categoryId: data.categoryId || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.products.set(id, product);

    return ctx.status(201).json(product);
  });

  productsApi.put('/:id', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;
    const adminResult = await adminMiddleware(ctx);
    if (adminResult) return adminResult;

    const productId = parseInt(ctx.params.id);
    const product = db.products.get(productId);

    if (!product) {
      return ctx.notFound('Product not found');
    }

    const body = await ctx.readJson<Partial<DBProduct>>();
    const updated: DBProduct = {
      ...product,
      ...body,
      id: productId,
      slug: body.name ? slugify(body.name) : product.slug,
      updatedAt: new Date(),
    };
    db.products.set(productId, updated);

    return ctx.json(updated);
  });

  productsApi.delete('/:id', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;
    const adminResult = await adminMiddleware(ctx);
    if (adminResult) return adminResult;

    const productId = parseInt(ctx.params.id);
    const product = db.products.get(productId);

    if (!product) {
      return ctx.notFound('Product not found');
    }

    product.isActive = false;
    product.updatedAt = new Date();

    return ctx.empty();
  });
});

// ============================================================================
// Cart Routes
// ============================================================================

app.group('/cart', (cartApi) => {
  cartApi.get('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };
    const cartItemsList = Array.from(db.cartItems.values()).filter(c => c.userId === user.userId);

    const items = cartItemsList.map(item => {
      const product = db.products.get(item.productId);
      return {
        id: item.id,
        product: product ? {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          stock: product.stock,
        } : null,
        quantity: item.quantity,
        subtotal: product ? product.price * item.quantity : 0,
      };
    }).filter(item => item.product !== null);

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return ctx.json({
      items,
      itemCount: items.length,
      total: Math.round(total * 100) / 100,
    });
  });

  cartApi.post('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };
    const body = await ctx.readJson();
    const result = validateAddToCart(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { productId, quantity } = result.value;

    const product = db.products.get(productId);
    if (!product || !product.isActive) {
      return ctx.notFound('Product not found');
    }
    if (product.stock < quantity) {
      return ctx.status(400).json({ error: 'Insufficient stock' });
    }

    const existingItem = Array.from(db.cartItems.values()).find(
      c => c.userId === user.userId && c.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      return ctx.json({
        id: existingItem.id,
        productId,
        quantity: existingItem.quantity,
        message: 'Cart updated',
      });
    }

    const id = db.nextId.cartItems++;
    const cartItem: DBCartItem = {
      id,
      userId: user.userId,
      productId,
      quantity,
      createdAt: new Date(),
    };
    db.cartItems.set(id, cartItem);

    return ctx.status(201).json({
      id,
      productId,
      quantity,
      message: 'Added to cart',
    });
  });

  cartApi.put('/:id', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };
    const itemId = parseInt(ctx.params.id);
    const cartItem = db.cartItems.get(itemId);

    if (!cartItem || cartItem.userId !== user.userId) {
      return ctx.notFound('Cart item not found');
    }

    const body = await ctx.readJson();
    const result = validateUpdateCart(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { quantity } = result.value;

    if (quantity === 0) {
      db.cartItems.delete(itemId);
      return ctx.json({ message: 'Item removed from cart' });
    }

    const product = db.products.get(cartItem.productId);
    if (product && product.stock < quantity) {
      return ctx.status(400).json({ error: 'Insufficient stock' });
    }

    cartItem.quantity = quantity;

    return ctx.json({
      id: itemId,
      quantity,
      message: 'Cart updated',
    });
  });

  cartApi.delete('/:id', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };
    const itemId = parseInt(ctx.params.id);
    const cartItem = db.cartItems.get(itemId);

    if (!cartItem || cartItem.userId !== user.userId) {
      return ctx.notFound('Cart item not found');
    }

    db.cartItems.delete(itemId);

    return ctx.json({ message: 'Item removed from cart' });
  });

  cartApi.delete('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };

    for (const [id, item] of db.cartItems) {
      if (item.userId === user.userId) {
        db.cartItems.delete(id);
      }
    }

    return ctx.json({ message: 'Cart cleared' });
  });
});

// ============================================================================
// Order Routes
// ============================================================================

app.group('/orders', (ordersApi) => {
  ordersApi.get('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number; role: string };
    const page = parseInt(getQueryParam(ctx, 'page') || '1');
    const limit = parseInt(getQueryParam(ctx, 'limit') || '10');
    const status = getQueryParam(ctx, 'status');

    let ordersList = Array.from(db.orders.values());

    if (user.role !== 'admin') {
      ordersList = ordersList.filter(o => o.userId === user.userId);
    }

    if (status) {
      ordersList = ordersList.filter(o => o.status === status);
    }

    ordersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const result = paginate(ordersList.map(o => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
    })), page, limit);

    return ctx.json(result);
  });

  ordersApi.post('/', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number };
    const body = await ctx.readJson();
    const result = validateCreateOrder(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { shippingAddress, notes } = result.value;

    const cartItemsList = Array.from(db.cartItems.values()).filter(c => c.userId === user.userId);

    if (cartItemsList.length === 0) {
      return ctx.status(400).json({ error: 'Cart is empty' });
    }

    const orderItemsToCreate: Omit<DBOrderItem, 'id' | 'orderId'>[] = [];
    let subtotal = 0;

    for (const cartItem of cartItemsList) {
      const product = db.products.get(cartItem.productId);
      if (!product || !product.isActive) {
        return ctx.status(400).json({ error: `Product ${cartItem.productId} is no longer available` });
      }
      if (product.stock < cartItem.quantity) {
        return ctx.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItemsToCreate.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const shipping = subtotal >= 100 ? 0 : 9.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    const orderId = db.nextId.orders++;
    const order: DBOrder = {
      id: orderId,
      userId: user.userId,
      status: 'pending',
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      shipping,
      total,
      shippingAddress,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.orders.set(orderId, order);

    for (const item of orderItemsToCreate) {
      const itemId = db.nextId.orderItems++;
      db.orderItems.set(itemId, {
        id: itemId,
        orderId,
        ...item,
      });

      const product = db.products.get(item.productId)!;
      product.stock -= item.quantity;
    }

    for (const [id, item] of db.cartItems) {
      if (item.userId === user.userId) {
        db.cartItems.delete(id);
      }
    }

    return ctx.status(201).json({
      id: orderId,
      status: 'pending',
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      message: 'Order placed successfully',
    });
  });

  ordersApi.get('/:id', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;

    const user = ctx.get('user') as { userId: number; role: string };
    const orderId = parseInt(ctx.params.id);
    const order = db.orders.get(orderId);

    if (!order) {
      return ctx.notFound('Order not found');
    }

    if (user.role !== 'admin' && order.userId !== user.userId) {
      return ctx.status(403).json({ error: 'Access denied' });
    }

    const items = Array.from(db.orderItems.values())
      .filter(i => i.orderId === orderId)
      .map(item => {
        const product = db.products.get(item.productId);
        return {
          id: item.id,
          product: product ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
          } : null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        };
      });

    return ctx.json({
      ...order,
      items,
    });
  });

  ordersApi.put('/:id/status', async (ctx) => {
    const authResult = await authMiddleware(ctx);
    if (authResult) return authResult;
    const adminResult = await adminMiddleware(ctx);
    if (adminResult) return adminResult;

    const orderId = parseInt(ctx.params.id);
    const order = db.orders.get(orderId);

    if (!order) {
      return ctx.notFound('Order not found');
    }

    const body = await ctx.readJson();
    const result = validateUpdateOrderStatus(body);

    if (!result.valid) {
      return ctx.validationError(result.errors!.map(e => ({ field: 'body', message: e })));
    }

    const { status } = result.value;

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return ctx.status(400).json({
        error: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    if (status === 'cancelled') {
      const items = Array.from(db.orderItems.values()).filter(i => i.orderId === orderId);
      for (const item of items) {
        const product = db.products.get(item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
    }

    order.status = status;
    order.updatedAt = new Date();

    return ctx.json({
      id: orderId,
      status: order.status,
      message: `Order status updated to ${status}`,
    });
  });
});

// ============================================================================
// Error Handler
// ============================================================================

app.setErrorHandler(async (error, ctx) => {
  console.error(`Error: ${error.message}`);
  return ctx.status(500).json({
    error: 'Internal server error',
    requestId: ctx.requestId,
  });
});

// Print routes
app.printRoutes();

// Start server
app.listen(3002).then(() => {
  const addr = app.address();
  if (addr) {
    console.log(`E-Commerce API started on port ${addr.port}`);
  }
});
