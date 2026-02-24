/**
 * Authentication Routes
 *
 * Handles user registration, login, logout, and token refresh.
 */

import type { Vexor, VexorContext } from '@vexorjs/core';
import * as authService from './service.js';
import { requireAuth, getUserIdFromContext } from './middleware.js';
import { rateLimit } from '../../middleware/rate-limit.js';
import {
  ValidationError,
} from '../../middleware/error-handler.js';
import {
  isValidEmail,
  isValidPassword,
  isNotEmpty,
} from '../../utils/validation.js';

// Stricter rate limit for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
});

export function registerAuthRoutes(app: Vexor): void {
  // ========================================================================
  // POST /auth/register - Register new user
  // ========================================================================
  app.post('/auth/register', {
    hooks: { preHandler: [authRateLimit] }
  }, async (ctx: VexorContext) => {
    const body = await ctx.readJson<{
      email?: string;
      password?: string;
      name?: string;
    }>();

    // Validate input
    const errors: { field: string; message: string }[] = [];

    if (!isNotEmpty(body.email)) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(body.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!isNotEmpty(body.password)) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else {
      const passwordCheck = isValidPassword(body.password);
      if (!passwordCheck.valid) {
        errors.push({ field: 'password', message: passwordCheck.message! });
      }
    }

    if (!isNotEmpty(body.name)) {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (body.name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    const result = await authService.register({
      email: body.email!,
      password: body.password!,
      name: body.name!,
    });

    return ctx.status(201).json({
      message: 'Registration successful',
      user: result.user,
      tokens: result.tokens,
    });
  });

  // ========================================================================
  // POST /auth/login - Login user
  // ========================================================================
  app.post('/auth/login', {
    hooks: { preHandler: [authRateLimit] }
  }, async (ctx: VexorContext) => {
    const body = await ctx.readJson<{
      email?: string;
      password?: string;
    }>();

    // Validate input
    if (!isNotEmpty(body.email) || !isNotEmpty(body.password)) {
      throw new ValidationError('Email and password are required');
    }

    const result = await authService.login({
      email: body.email!,
      password: body.password!,
    });

    return ctx.json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens,
    });
  });

  // ========================================================================
  // POST /auth/refresh - Refresh access token
  // ========================================================================
  app.post('/auth/refresh', async (ctx: VexorContext) => {
    const body = await ctx.readJson<{ refreshToken?: string }>();

    if (!isNotEmpty(body.refreshToken)) {
      throw new ValidationError('Refresh token is required');
    }

    const tokens = await authService.refreshAccessToken(body.refreshToken!);

    return ctx.json({
      message: 'Token refreshed',
      tokens,
    });
  });

  // ========================================================================
  // POST /auth/logout - Logout user
  // ========================================================================
  app.post('/auth/logout', async (ctx: VexorContext) => {
    const body = await ctx.readJson<{ refreshToken?: string }>();

    if (body.refreshToken) {
      await authService.logout(body.refreshToken);
    }

    return ctx.json({ message: 'Logout successful' });
  });

  // ========================================================================
  // POST /auth/logout-all - Logout from all devices
  // ========================================================================
  app.post('/auth/logout-all', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    await authService.logoutAll(getUserIdFromContext(ctx)!);

    return ctx.json({ message: 'Logged out from all devices' });
  });

  // ========================================================================
  // GET /auth/me - Get current user
  // ========================================================================
  app.get('/auth/me', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    const user = await authService.getUserById(getUserIdFromContext(ctx)!);

    if (!user) {
      throw new ValidationError('User not found');
    }

    return ctx.json({ user });
  });

  // ========================================================================
  // POST /auth/change-password - Change password
  // ========================================================================
  app.post('/auth/change-password', {
    hooks: { preHandler: [requireAuth()] }
  }, async (ctx: VexorContext) => {
    const body = await ctx.readJson<{
      currentPassword?: string;
      newPassword?: string;
    }>();

    // Validate input
    if (!isNotEmpty(body.currentPassword)) {
      throw new ValidationError('Current password is required');
    }

    if (!isNotEmpty(body.newPassword)) {
      throw new ValidationError('New password is required');
    }

    const passwordCheck = isValidPassword(body.newPassword!);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.message!);
    }

    await authService.changePassword(
      getUserIdFromContext(ctx)!,
      body.currentPassword!,
      body.newPassword!
    );

    return ctx.json({ message: 'Password changed successfully' });
  });
}
