/**
 * Users Tests
 */

import { describe, it, expect } from 'vitest';
import { baseUrl, getAdminToken, getUserToken } from './setup.js';

describe('Users', () => {
  describe('GET /users', () => {
    it('should list users for admin', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ email: string }>;
        pagination: { total: number };
      };
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it('should reject non-admin users', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });

    it('should filter users by role', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users?role=admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ role: string }>;
      };
      expect(data.data.every((u) => u.role === 'admin')).toBe(true);
    });

    it('should search users by name', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users?search=Admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        data: Array<{ name: string }>;
      };
      expect(data.data.some((u) => u.name.includes('Admin'))).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should get own profile', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { user: { email: string } };
      expect(data.user.email).toBe('user@test.com');
    });

    it('should allow admin to view any user', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { user: { email: string } };
      expect(data.user.email).toBe('user@test.com');
    });

    it('should reject viewing other users profile', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update own profile', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { user: { name: string } };
      expect(data.user.name).toBe('Updated Name');
    });

    it('should allow admin to update role', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'admin',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { user: { role: string } };
      expect(data.user.role).toBe('admin');
    });

    it('should not allow user to change own role', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'admin',
        }),
      });

      // Role change is silently ignored for non-admins
      expect(response.status).toBe(400); // No valid fields to update
    });

    it('should validate email uniqueness', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'admin@test.com',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete user (admin only)', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users/2`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);

      // Verify user is deactivated
      const getResponse = await fetch(`${baseUrl}/users/2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await getResponse.json() as { user: { is_active: number } };
      expect(data.user.is_active).toBe(0);
    });

    it('should prevent self-deletion', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/users/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(400);
    });

    it('should reject non-admin deletion', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/users/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(403);
    });
  });
});
