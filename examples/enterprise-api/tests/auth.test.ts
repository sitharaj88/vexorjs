/**
 * Authentication Tests
 */

import { describe, it, expect } from 'vitest';
import { baseUrl, getAdminToken, getUserToken } from './setup.js';

describe('Authentication', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'newuser@test.com',
          password: 'NewUser123!',
          name: 'New User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json() as {
        user: { email: string; name: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      };
      expect(data.user.email).toBe('newuser@test.com');
      expect(data.user.name).toBe('New User');
      expect(data.user.role).toBe('user');
      expect(data.tokens.accessToken).toBeDefined();
      expect(data.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'Password123!',
          name: 'Duplicate User',
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json() as { code: string };
      expect(data.code).toBe('CONFLICT');
    });

    it('should validate password strength', async () => {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'weak@test.com',
          password: 'weak',
          name: 'Weak Password',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json() as { code: string };
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should validate email format', async () => {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Password123!',
          name: 'Invalid Email',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'Admin123!',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        user: { email: string; role: string };
        tokens: { accessToken: string; refreshToken: string };
      };
      expect(data.user.email).toBe('admin@test.com');
      expect(data.user.role).toBe('admin');
      expect(data.tokens.accessToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json() as { code: string };
      expect(data.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should reject non-existent user', async () => {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const token = await getAdminToken();

      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json() as { user: { email: string; role: string } };
      expect(data.user.email).toBe('admin@test.com');
      expect(data.user.role).toBe('admin');
    });

    it('should reject request without token', async () => {
      const response = await fetch(`${baseUrl}/auth/me`);

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      // First login to get refresh token
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'Admin123!',
        }),
      });

      const loginData = await loginResponse.json() as {
        tokens: { refreshToken: string };
      };

      // Use refresh token
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: loginData.tokens.refreshToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json() as {
        tokens: { accessToken: string; refreshToken: string };
      };
      expect(data.tokens.accessToken).toBeDefined();
      expect(data.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-refresh-token',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: 'User1234!',
          newPassword: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(200);

      // Verify old password no longer works
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@test.com',
          password: 'User1234!',
        }),
      });

      expect(loginResponse.status).toBe(401);
    });

    it('should reject wrong current password', async () => {
      const token = await getUserToken();

      const response = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(400);
    });
  });
});
