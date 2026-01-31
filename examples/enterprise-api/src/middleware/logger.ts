/**
 * Request Logger Middleware
 *
 * Structured logging for all HTTP requests.
 * Works with Vexor's hook pattern (no next() function).
 */

import type { VexorContext } from '@vexorjs/core';
import { config } from '../config/index.js';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  requestId: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  userId?: number;
  message?: string;
  error?: string;
}

function formatLog(entry: LogEntry): string {
  if (config.logFormat === 'pretty') {
    const status = entry.statusCode || '-';
    const duration = entry.duration ? `${entry.duration}ms` : '-';
    const user = entry.userId ? `user:${entry.userId}` : 'anonymous';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()} ${entry.method} ${entry.path} ${status} ${duration} ${user}`;
  }

  return JSON.stringify(entry);
}

function log(entry: LogEntry): void {
  const levels = ['debug', 'info', 'warn', 'error'];
  const currentLevel = levels.indexOf(config.logLevel);
  const entryLevel = levels.indexOf(entry.level);

  if (entryLevel >= currentLevel) {
    console.log(formatLog(entry));
  }
}

function getClientIp(ctx: VexorContext): string {
  const forwardedFor = ctx.header('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = ctx.header('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Request logger - logs request start
 * Use in onRequest hook
 */
export function requestLogger() {
  return async (ctx: VexorContext): Promise<void> => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Store start time in context for later duration calculation
    (ctx as any)._requestStartTime = startTime;

    // Log request start
    log({
      timestamp,
      level: 'debug',
      requestId: ctx.requestId,
      method: ctx.method,
      path: ctx.path,
      userAgent: ctx.header('user-agent') ?? undefined,
      ip: getClientIp(ctx),
      userId: (ctx as any).userId,
      message: 'Request started',
    });
  };
}

/**
 * Response logger - logs request completion
 * Use in onSend hook or call manually after handling request
 */
export function responseLogger(statusCode: number = 200) {
  return async (ctx: VexorContext): Promise<void> => {
    const startTime = (ctx as any)._requestStartTime || Date.now();
    const duration = Date.now() - startTime;

    log({
      timestamp: new Date().toISOString(),
      level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
      requestId: ctx.requestId,
      method: ctx.method,
      path: ctx.path,
      statusCode,
      duration,
      userAgent: ctx.header('user-agent') ?? undefined,
      ip: getClientIp(ctx),
      userId: (ctx as any).userId,
    });
  };
}

/**
 * Log an error for a request
 */
export function logError(ctx: VexorContext, error: Error): void {
  const startTime = (ctx as any)._requestStartTime || Date.now();
  const duration = Date.now() - startTime;

  log({
    timestamp: new Date().toISOString(),
    level: 'error',
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    duration,
    ip: getClientIp(ctx),
    userId: (ctx as any).userId,
    error: error.message,
  });
}

/**
 * Audit logging for sensitive operations
 */
export function auditLog(
  action: string,
  resource: string,
  resourceId: string | null,
  details: string | null,
  ctx: VexorContext
): void {
  log({
    timestamp: new Date().toISOString(),
    level: 'info',
    requestId: ctx.requestId,
    method: ctx.method,
    path: ctx.path,
    ip: getClientIp(ctx),
    userId: (ctx as any).userId,
    message: `AUDIT: ${action} ${resource}${resourceId ? `:${resourceId}` : ''}${details ? ` - ${details}` : ''}`,
  });
}
