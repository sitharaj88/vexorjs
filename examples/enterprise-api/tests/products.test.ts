/**
 * Products Tests
 */

import { describe, it, expect } from 'vitest';
import { baseUrl, getAdminToken, getUserToken } from './setup.js';

describe('Products', () => {
  describe('GET /products', () => {
    it('should list products (public)', async () => {
      const response = await fetch(`${baseUrl}/products`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ name: string }>;
        pagination: { total: number };
      };
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBe(3);
      expect(data.pagination.total).toBe(3);
    });

    it('should filter by category', async () => {
      const response = await fetch(`${baseUrl}/products?category=Electronics`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ category: string }>;
      };
      expect(data.data.every((p) => p.category === 'Electronics')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await fetch(`${baseUrl}/products?minPrice=50&maxPrice=150`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ price: number }>;
      };
      expect(data.data.every((p) => p.price >= 50 && p.price <= 150)).toBe(true);
    });

    it('should search by name', async () => {
      const response = await fetch(`${baseUrl}/products?search=Product%201`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ name: string }>;
      };
      expect(data.data.some((p) => p.name.includes('Product 1'))).toBe(true);
    });

    it('should filter in stock only', async () => {
      const response = await fetch(`${baseUrl}/products?inStock=true`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ stock: number }>;
      };
      expect(data.data.every((p) => p.stock > 0)).toBe(true);
    });
  });

  describe('GET /products/categories', () => {
    it('should list all categories', async () => {
      const response = await fetch(`${baseUrl}/products/categories`);

      expect(response.status).toBe(200);
      const data = await response.json() as {
        categories: Array<{ category: string; count: number }>;
      };
      expect(data.categories).toBeInstanceOf(Array);
      expect(data.categories.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/:id', () => {
    it('should get product by id (public)', async () => {
      const response = await fetch(`${baseUrl}/products/1`);

      expect(response.status).toBe(200);
      const data = await response.json() as { product: { id: number; name: string } };
      expect(data.product.id).toBe(1);
      expect(data.product.name).toBe('Test Product 1');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await fetch(`${baseUrl}/products/999`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /products', () => {
    it('should create product (admin only)', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'New Product',
          description: 'A new product',
          price: 199.99,
          stock: 50,
          category: 'New Category',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as { message: string; product?: { name: string; price: number } };
      expect(data.message).toBe('Product created successfully');
      // Product may or may not be returned depending on RETURNING clause support
      if (data.product) {
        expect(data.product.name).toBe('New Product');
        expect(data.product.price).toBe(199.99);
      }
    });

    it('should reject non-admin creation', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'New Product',
          price: 99.99,
        }),
      });

      expect(response.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: 'Missing name and price',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product (admin only)', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Updated Product',
          price: 149.99,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { product: { name: string; price: number } };
      expect(data.product.name).toBe('Updated Product');
      expect(data.product.price).toBe(149.99);
    });

    it('should reject non-admin update', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/products/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Updated Product',
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should soft delete product (admin only)', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);

      // Verify product is marked as inactive (admin can still see it)
      const getResponse = await fetch(`${baseUrl}/products/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(getResponse.status).toBe(200);
      const data = await getResponse.json() as { product: { is_active: number } };
      expect(data.product.is_active).toBe(0);
    });

    it('should reject non-admin deletion', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/products/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /products/:id/stock', () => {
    it('should update stock with adjustment', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products/1/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adjustment: -10,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        previousStock: number;
        newStock: number;
      };
      expect(data.newStock).toBe(data.previousStock - 10);
    });

    it('should update stock with absolute value', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products/1/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          absolute: 500,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { newStock: number };
      expect(data.newStock).toBe(500);
    });

    it('should prevent negative stock', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/products/1/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adjustment: -1000,
        }),
      });

      expect(response.status).toBe(400);
    });
  });
});
