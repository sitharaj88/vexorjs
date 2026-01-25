/**
 * Session Management
 *
 * Secure session management with multiple storage backends,
 * automatic renewal, and cross-runtime compatibility.
 */

/**
 * Session data interface
 */
export interface SessionData {
  /** Session ID */
  id: string;
  /** User ID (if authenticated) */
  userId?: string;
  /** Session creation time */
  createdAt: number;
  /** Last access time */
  accessedAt: number;
  /** Expiration time */
  expiresAt: number;
  /** Custom session data */
  data: Record<string, unknown>;
}

/**
 * Session store interface
 */
export interface SessionStore {
  /** Get session by ID */
  get(id: string): Promise<SessionData | null>;
  /** Set session data */
  set(id: string, session: SessionData): Promise<void>;
  /** Delete session */
  delete(id: string): Promise<void>;
  /** Touch session (update access time) */
  touch(id: string, expiresAt: number): Promise<void>;
  /** Clean expired sessions */
  cleanup?(): Promise<void>;
}

/**
 * Session options
 */
export interface SessionOptions {
  /** Session store */
  store?: SessionStore;
  /** Session secret for cookie signing */
  secret: string;
  /** Cookie name */
  cookieName?: string;
  /** Session duration in seconds */
  maxAge?: number;
  /** Rolling session (renew on each request) */
  rolling?: boolean;
  /** Renew session when this fraction of maxAge remains */
  renewThreshold?: number;
  /** Cookie options */
  cookie?: {
    /** Cookie path */
    path?: string;
    /** Cookie domain */
    domain?: string;
    /** Secure flag (HTTPS only) */
    secure?: boolean;
    /** HttpOnly flag */
    httpOnly?: boolean;
    /** SameSite attribute */
    sameSite?: 'strict' | 'lax' | 'none';
  };
}

/**
 * In-memory session store (for development)
 */
export class MemorySessionStore implements SessionStore {
  private sessions = new Map<string, SessionData>();
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor() {
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get(id: string): Promise<SessionData | null> {
    const session = this.sessions.get(id);
    if (!session) return null;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(id);
      return null;
    }

    return session;
  }

  async set(id: string, session: SessionData): Promise<void> {
    this.sessions.set(id, session);
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }

  async touch(id: string, expiresAt: number): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.accessedAt = Date.now();
      session.expiresAt = expiresAt;
    }
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Cookie-based session store (stateless, uses signed cookies)
 */
export class CookieSessionStore implements SessionStore {
  async get(_id: string): Promise<SessionData | null> {
    // Cookie sessions are handled differently - data is in the cookie
    return null;
  }

  async set(_id: string, _session: SessionData): Promise<void> {
    // Cookie sessions are handled differently - data is in the cookie
  }

  async delete(_id: string): Promise<void> {
    // Cookie sessions are handled differently
  }

  async touch(_id: string, _expiresAt: number): Promise<void> {
    // Cookie sessions are handled differently
  }
}

/**
 * Generate secure session ID
 */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sign data with secret (HMAC-SHA256)
 */
async function signData(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Verify signed data
 */
async function verifySignature(data: string, signature: string, secret: string): Promise<boolean> {
  const expected = await signData(data, secret);
  return signature === expected;
}

/**
 * Session manager
 */
export class SessionManager {
  private options: Required<SessionOptions>;
  private store: SessionStore;

  constructor(options: SessionOptions) {
    this.options = {
      store: options.store ?? new MemorySessionStore(),
      secret: options.secret,
      cookieName: options.cookieName ?? 'vexor.sid',
      maxAge: options.maxAge ?? 24 * 60 * 60, // 24 hours default
      rolling: options.rolling ?? false,
      renewThreshold: options.renewThreshold ?? 0.5,
      cookie: {
        path: '/',
        domain: undefined,
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        ...options.cookie,
      },
    };
    this.store = this.options.store;
  }

  /**
   * Create a new session
   */
  async create(data: Record<string, unknown> = {}, userId?: string): Promise<Session> {
    const id = generateSessionId();
    const now = Date.now();
    const maxAgeMs = this.options.maxAge * 1000;

    const sessionData: SessionData = {
      id,
      userId,
      createdAt: now,
      accessedAt: now,
      expiresAt: now + maxAgeMs,
      data,
    };

    await this.store.set(id, sessionData);

    return new Session(sessionData, this);
  }

  /**
   * Get session by ID
   */
  async get(id: string): Promise<Session | null> {
    const sessionData = await this.store.get(id);
    if (!sessionData) return null;

    return new Session(sessionData, this);
  }

  /**
   * Load session from cookie value
   */
  async loadFromCookie(cookieValue: string): Promise<Session | null> {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return null;

    const [id, signature] = parts;

    // Verify signature
    const isValid = await verifySignature(id, signature, this.options.secret);
    if (!isValid) return null;

    return this.get(id);
  }

  /**
   * Generate signed cookie value for session
   */
  async getCookieValue(session: Session): Promise<string> {
    const signature = await signData(session.id, this.options.secret);
    return `${session.id}.${signature}`;
  }

  /**
   * Get cookie options string
   */
  getCookieOptions(session: Session): string {
    const parts: string[] = [];

    if (this.options.cookie.path) {
      parts.push(`Path=${this.options.cookie.path}`);
    }

    if (this.options.cookie.domain) {
      parts.push(`Domain=${this.options.cookie.domain}`);
    }

    if (this.options.cookie.secure) {
      parts.push('Secure');
    }

    if (this.options.cookie.httpOnly) {
      parts.push('HttpOnly');
    }

    if (this.options.cookie.sameSite) {
      parts.push(`SameSite=${this.options.cookie.sameSite}`);
    }

    // Max-Age
    const remainingMs = session.expiresAt - Date.now();
    const maxAge = Math.max(0, Math.floor(remainingMs / 1000));
    parts.push(`Max-Age=${maxAge}`);

    return parts.join('; ');
  }

  /**
   * Generate Set-Cookie header value
   */
  async getSetCookieHeader(session: Session): Promise<string> {
    const value = await this.getCookieValue(session);
    const options = this.getCookieOptions(session);
    return `${this.options.cookieName}=${value}; ${options}`;
  }

  /**
   * Generate Set-Cookie header for session deletion
   */
  getDeleteCookieHeader(): string {
    return `${this.options.cookieName}=; Path=${this.options.cookie.path ?? '/'}; Max-Age=0`;
  }

  /**
   * Check if session should be renewed
   */
  shouldRenew(session: Session): boolean {
    if (!this.options.rolling) return false;

    const maxAgeMs = this.options.maxAge * 1000;
    const threshold = maxAgeMs * this.options.renewThreshold;
    const remaining = session.expiresAt - Date.now();

    return remaining < threshold;
  }

  /**
   * Renew session expiration
   */
  async renew(session: Session): Promise<void> {
    const maxAgeMs = this.options.maxAge * 1000;
    const newExpiresAt = Date.now() + maxAgeMs;

    await this.store.touch(session.id, newExpiresAt);
    session.updateExpiration(newExpiresAt);
  }

  /**
   * Save session changes
   */
  async save(session: Session): Promise<void> {
    await this.store.set(session.id, session.toData());
  }

  /**
   * Destroy session
   */
  async destroy(session: Session): Promise<void> {
    await this.store.delete(session.id);
  }

  /**
   * Get cookie name
   */
  get cookieName(): string {
    return this.options.cookieName;
  }
}

/**
 * Session instance
 */
export class Session {
  private _data: SessionData;
  private _manager: SessionManager;
  private _modified = false;

  constructor(data: SessionData, manager: SessionManager) {
    this._data = data;
    this._manager = manager;
  }

  /**
   * Get session ID
   */
  get id(): string {
    return this._data.id;
  }

  /**
   * Get user ID
   */
  get userId(): string | undefined {
    return this._data.userId;
  }

  /**
   * Set user ID
   */
  set userId(value: string | undefined) {
    this._data.userId = value;
    this._modified = true;
  }

  /**
   * Get creation time
   */
  get createdAt(): number {
    return this._data.createdAt;
  }

  /**
   * Get last access time
   */
  get accessedAt(): number {
    return this._data.accessedAt;
  }

  /**
   * Get expiration time
   */
  get expiresAt(): number {
    return this._data.expiresAt;
  }

  /**
   * Check if session is authenticated
   */
  get isAuthenticated(): boolean {
    return this._data.userId !== undefined;
  }

  /**
   * Check if session was modified
   */
  get isModified(): boolean {
    return this._modified;
  }

  /**
   * Get session data value
   */
  get<T = unknown>(key: string): T | undefined {
    return this._data.data[key] as T;
  }

  /**
   * Set session data value
   */
  set(key: string, value: unknown): void {
    this._data.data[key] = value;
    this._modified = true;
  }

  /**
   * Delete session data value
   */
  delete(key: string): void {
    delete this._data.data[key];
    this._modified = true;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return key in this._data.data;
  }

  /**
   * Get all session data
   */
  all(): Record<string, unknown> {
    return { ...this._data.data };
  }

  /**
   * Clear all session data
   */
  clear(): void {
    this._data.data = {};
    this._modified = true;
  }

  /**
   * Save session changes
   */
  async save(): Promise<void> {
    if (this._modified) {
      await this._manager.save(this);
      this._modified = false;
    }
  }

  /**
   * Destroy session
   */
  async destroy(): Promise<void> {
    await this._manager.destroy(this);
  }

  /**
   * Regenerate session ID (for security after login)
   */
  async regenerate(): Promise<Session> {
    // Create new session with same data
    const newSession = await this._manager.create(this._data.data, this._data.userId);

    // Destroy old session
    await this.destroy();

    return newSession;
  }

  /**
   * Update expiration (internal)
   */
  updateExpiration(expiresAt: number): void {
    this._data.expiresAt = expiresAt;
    this._data.accessedAt = Date.now();
  }

  /**
   * Convert to session data
   */
  toData(): SessionData {
    return { ...this._data };
  }
}

/**
 * Create session manager
 */
export function createSessionManager(options: SessionOptions): SessionManager {
  return new SessionManager(options);
}

/**
 * Parse cookies from header string
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  }

  return cookies;
}
