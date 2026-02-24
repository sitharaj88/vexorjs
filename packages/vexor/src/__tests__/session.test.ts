/**
 * Session Management Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MemorySessionStore,
  SessionManager,
  Session,
  parseCookies,
} from '../auth/session.js';
import type { SessionData } from '../auth/session.js';

// ---------------------------------------------------------------------------
// MemorySessionStore
// ---------------------------------------------------------------------------
describe('MemorySessionStore', () => {
  let store: MemorySessionStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemorySessionStore();
  });

  afterEach(() => {
    store.destroy();
    vi.useRealTimers();
  });

  it('should set and get a session', async () => {
    const session: SessionData = {
      id: 'abc123',
      createdAt: Date.now(),
      accessedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
      data: { foo: 'bar' },
    };

    await store.set('abc123', session);
    const result = await store.get('abc123');
    expect(result).toEqual(session);
  });

  it('should return null for non-existent session', async () => {
    const result = await store.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should delete a session', async () => {
    const session: SessionData = {
      id: 'del1',
      createdAt: Date.now(),
      accessedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
      data: {},
    };
    await store.set('del1', session);
    await store.delete('del1');
    const result = await store.get('del1');
    expect(result).toBeNull();
  });

  it('should touch a session updating accessedAt and expiresAt', async () => {
    const now = Date.now();
    const session: SessionData = {
      id: 'touch1',
      createdAt: now,
      accessedAt: now,
      expiresAt: now + 60_000,
      data: {},
    };
    await store.set('touch1', session);

    vi.advanceTimersByTime(5_000);
    const newExpires = Date.now() + 120_000;
    await store.touch('touch1', newExpires);

    const result = await store.get('touch1');
    expect(result).not.toBeNull();
    expect(result!.expiresAt).toBe(newExpires);
    expect(result!.accessedAt).toBe(Date.now());
  });

  it('should return null for expired sessions', async () => {
    const now = Date.now();
    const session: SessionData = {
      id: 'exp1',
      createdAt: now,
      accessedAt: now,
      expiresAt: now + 1_000,
      data: {},
    };
    await store.set('exp1', session);

    vi.advanceTimersByTime(2_000);
    const result = await store.get('exp1');
    expect(result).toBeNull();
  });

  it('should cleanup expired sessions', async () => {
    const now = Date.now();
    await store.set('alive', {
      id: 'alive',
      createdAt: now,
      accessedAt: now,
      expiresAt: now + 300_000,
      data: {},
    });
    await store.set('dead', {
      id: 'dead',
      createdAt: now,
      accessedAt: now,
      expiresAt: now + 1_000,
      data: {},
    });

    vi.advanceTimersByTime(2_000);
    await store.cleanup();

    expect(await store.get('alive')).not.toBeNull();
    expect(await store.get('dead')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SessionManager
// ---------------------------------------------------------------------------
describe('SessionManager', () => {
  let manager: SessionManager;
  let store: MemorySessionStore;

  beforeEach(() => {
    store = new MemorySessionStore();
    manager = new SessionManager({
      secret: 'test-secret-key-12345',
      store,
      maxAge: 3600,
      cookie: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
    });
  });

  afterEach(() => {
    store.destroy();
  });

  it('should create a new session', async () => {
    const session = await manager.create({ role: 'admin' }, 'user-1');
    expect(session).toBeInstanceOf(Session);
    expect(session.id).toBeTruthy();
    expect(session.userId).toBe('user-1');
    expect(session.get('role')).toBe('admin');
  });

  it('should get a session by id', async () => {
    const created = await manager.create({ x: 1 });
    const found = await manager.get(created.id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(created.id);
  });

  it('should return null for unknown session id', async () => {
    const found = await manager.get('unknown-id');
    expect(found).toBeNull();
  });

  it('should load session from valid signed cookie', async () => {
    const session = await manager.create();
    const cookieValue = await manager.getCookieValue(session);
    const loaded = await manager.loadFromCookie(cookieValue);
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe(session.id);
  });

  it('should reject cookie with invalid signature', async () => {
    const session = await manager.create();
    const loaded = await manager.loadFromCookie(`${session.id}.invalidsig`);
    expect(loaded).toBeNull();
  });

  it('should reject cookie with wrong format', async () => {
    const loaded = await manager.loadFromCookie('no-dot-here');
    expect(loaded).toBeNull();
  });

  it('should produce correct getCookieValue format', async () => {
    const session = await manager.create();
    const value = await manager.getCookieValue(session);
    const parts = value.split('.');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe(session.id);
  });

  it('should produce correct getCookieOptions', async () => {
    const session = await manager.create();
    const opts = manager.getCookieOptions(session);
    expect(opts).toContain('Path=/');
    expect(opts).toContain('HttpOnly');
    expect(opts).toContain('SameSite=lax');
    expect(opts).toContain('Max-Age=');
    expect(opts).not.toContain('Secure');
  });

  it('should include Secure when configured', async () => {
    const secureManager = new SessionManager({
      secret: 'secret',
      cookie: { secure: true },
    });
    const session = await secureManager.create();
    const opts = secureManager.getCookieOptions(session);
    expect(opts).toContain('Secure');
  });
});

// ---------------------------------------------------------------------------
// Session class
// ---------------------------------------------------------------------------
describe('Session', () => {
  let manager: SessionManager;
  let store: MemorySessionStore;

  beforeEach(() => {
    store = new MemorySessionStore();
    manager = new SessionManager({
      secret: 'test-secret',
      store,
    });
  });

  afterEach(() => {
    store.destroy();
  });

  it('should get and set data', async () => {
    const session = await manager.create();
    session.set('key', 'value');
    expect(session.get('key')).toBe('value');
  });

  it('should delete data', async () => {
    const session = await manager.create({ keep: 1, remove: 2 });
    session.delete('remove');
    expect(session.has('remove')).toBe(false);
    expect(session.has('keep')).toBe(true);
  });

  it('should report has correctly', async () => {
    const session = await manager.create({ existing: true });
    expect(session.has('existing')).toBe(true);
    expect(session.has('missing')).toBe(false);
  });

  it('should clear all data', async () => {
    const session = await manager.create({ a: 1, b: 2 });
    session.clear();
    expect(session.all()).toEqual({});
  });

  it('should track isModified after set', async () => {
    const session = await manager.create();
    expect(session.isModified).toBe(false);
    session.set('x', 1);
    expect(session.isModified).toBe(true);
  });

  it('should track isModified after delete', async () => {
    const session = await manager.create({ x: 1 });
    expect(session.isModified).toBe(false);
    session.delete('x');
    expect(session.isModified).toBe(true);
  });

  it('should track isModified after clear', async () => {
    const session = await manager.create({ x: 1 });
    expect(session.isModified).toBe(false);
    session.clear();
    expect(session.isModified).toBe(true);
  });

  it('should save and reset isModified', async () => {
    const session = await manager.create();
    session.set('k', 'v');
    expect(session.isModified).toBe(true);
    await session.save();
    expect(session.isModified).toBe(false);
  });

  it('should not write to store if not modified', async () => {
    const session = await manager.create();
    const spy = vi.spyOn(store, 'set');
    await session.save();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should destroy session', async () => {
    const session = await manager.create();
    const id = session.id;
    await session.destroy();
    const found = await manager.get(id);
    expect(found).toBeNull();
  });

  it('should regenerate session with new id but same data', async () => {
    const session = await manager.create({ role: 'admin' }, 'user-1');
    const oldId = session.id;
    const newSession = await session.regenerate();

    expect(newSession.id).not.toBe(oldId);
    expect(newSession.get('role')).toBe('admin');
    expect(newSession.userId).toBe('user-1');

    // Old session should be destroyed
    const old = await manager.get(oldId);
    expect(old).toBeNull();
  });

  it('should report isAuthenticated', async () => {
    const anon = await manager.create();
    expect(anon.isAuthenticated).toBe(false);

    const auth = await manager.create({}, 'user-1');
    expect(auth.isAuthenticated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseCookies
// ---------------------------------------------------------------------------
describe('parseCookies', () => {
  it('should parse a simple cookie header', () => {
    const result = parseCookies('name=value');
    expect(result).toEqual({ name: 'value' });
  });

  it('should parse multiple cookies', () => {
    const result = parseCookies('a=1; b=2; c=3');
    expect(result).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('should handle values with equals signs', () => {
    const result = parseCookies('token=abc=def==');
    expect(result).toEqual({ token: 'abc=def==' });
  });

  it('should return empty object for empty string', () => {
    expect(parseCookies('')).toEqual({});
  });
});
