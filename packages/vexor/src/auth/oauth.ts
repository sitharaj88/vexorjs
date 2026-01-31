/**
 * OAuth2/OIDC Authentication
 *
 * Supports major OAuth2 providers (Google, GitHub, Discord, etc.)
 * and generic OAuth2/OIDC flows.
 */

import type { VexorContext } from '../core/context.js';
import { randomUUID } from 'node:crypto';

// ============================================================================
// Types
// ============================================================================

export interface OAuthProvider {
  /** Provider name */
  name: string;
  /** Authorization endpoint */
  authorizationUrl: string;
  /** Token endpoint */
  tokenUrl: string;
  /** User info endpoint */
  userInfoUrl?: string;
  /** Scopes to request */
  scopes: string[];
  /** Client ID */
  clientId: string;
  /** Client secret */
  clientSecret: string;
  /** Additional authorization params */
  authParams?: Record<string, string>;
}

export interface OAuthConfig {
  /** OAuth providers */
  providers: Record<string, OAuthProvider>;
  /** Callback URL base (e.g., 'http://localhost:3000') */
  callbackBase: string;
  /** Callback path template (default: '/auth/{provider}/callback') */
  callbackPath?: string;
  /** State storage */
  stateStore?: OAuthStateStore;
  /** Session storage for tokens */
  sessionStore?: OAuthSessionStore;
  /** State TTL in seconds (default: 600 = 10 minutes) */
  stateTtl?: number;
  /** Custom user profile transformer */
  profileTransformer?: (provider: string, profile: OAuthProfile) => OAuthUser;
}

export interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  raw: Record<string, unknown>;
}

export interface OAuthUser {
  id: string;
  provider: string;
  email?: string;
  name?: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  raw: Record<string, unknown>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  scope?: string;
  idToken?: string;
}

export interface OAuthStateStore {
  set(state: string, data: OAuthStateData): Promise<void>;
  get(state: string): Promise<OAuthStateData | null>;
  delete(state: string): Promise<void>;
}

export interface OAuthStateData {
  provider: string;
  redirectUri: string;
  codeVerifier?: string;
  nonce?: string;
  returnTo?: string;
  createdAt: number;
}

export interface OAuthSessionStore {
  set(sessionId: string, user: OAuthUser): Promise<void>;
  get(sessionId: string): Promise<OAuthUser | null>;
  delete(sessionId: string): Promise<void>;
}

// ============================================================================
// Built-in Providers
// ============================================================================

export const providers = {
  google: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'google',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['openid', 'email', 'profile'],
    clientId,
    clientSecret,
    authParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  }),

  github: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'github',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scopes: ['read:user', 'user:email'],
    clientId,
    clientSecret,
  }),

  discord: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'discord',
    authorizationUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userInfoUrl: 'https://discord.com/api/users/@me',
    scopes: ['identify', 'email'],
    clientId,
    clientSecret,
  }),

  twitter: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'twitter',
    authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userInfoUrl: 'https://api.twitter.com/2/users/me',
    scopes: ['tweet.read', 'users.read', 'offline.access'],
    clientId,
    clientSecret,
    authParams: {
      code_challenge_method: 'S256',
    },
  }),

  microsoft: (clientId: string, clientSecret: string, tenant?: string): OAuthProvider => ({
    name: 'microsoft',
    authorizationUrl: `https://login.microsoftonline.com/${tenant || 'common'}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant || 'common'}/oauth2/v2.0/token`,
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: ['openid', 'email', 'profile', 'User.Read'],
    clientId,
    clientSecret,
  }),

  facebook: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'facebook',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v18.0/me?fields=id,name,email,picture',
    scopes: ['email', 'public_profile'],
    clientId,
    clientSecret,
  }),

  linkedin: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'linkedin',
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email'],
    clientId,
    clientSecret,
  }),

  apple: (clientId: string, clientSecret: string): OAuthProvider => ({
    name: 'apple',
    authorizationUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    scopes: ['name', 'email'],
    clientId,
    clientSecret,
    authParams: {
      response_mode: 'form_post',
    },
  }),
};

// ============================================================================
// Memory State Store
// ============================================================================

export class MemoryStateStore implements OAuthStateStore {
  private states = new Map<string, OAuthStateData>();
  private ttl: number;

  constructor(ttl: number = 600) {
    this.ttl = ttl;
    // Cleanup expired states every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async set(state: string, data: OAuthStateData): Promise<void> {
    this.states.set(state, data);
  }

  async get(state: string): Promise<OAuthStateData | null> {
    const data = this.states.get(state);
    if (!data) return null;

    // Check expiration
    if (Date.now() - data.createdAt > this.ttl * 1000) {
      this.states.delete(state);
      return null;
    }

    return data;
  }

  async delete(state: string): Promise<void> {
    this.states.delete(state);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [state, data] of this.states) {
      if (now - data.createdAt > this.ttl * 1000) {
        this.states.delete(state);
      }
    }
  }
}

// ============================================================================
// PKCE Helpers
// ============================================================================

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============================================================================
// OAuth Manager
// ============================================================================

export class OAuth {
  private config: Required<OAuthConfig>;

  constructor(config: OAuthConfig) {
    this.config = {
      callbackPath: '/auth/{provider}/callback',
      stateStore: new MemoryStateStore(),
      stateTtl: 600,
      profileTransformer: defaultProfileTransformer,
      sessionStore: undefined as unknown as OAuthSessionStore,
      ...config,
    };
  }

  /**
   * Get authorization URL for a provider
   */
  async getAuthorizationUrl(
    providerName: string,
    options: {
      returnTo?: string;
      scopes?: string[];
      state?: string;
    } = {}
  ): Promise<string> {
    const provider = this.config.providers[providerName];
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerName}`);
    }

    const state = options.state || randomUUID();
    const redirectUri = this.getCallbackUrl(providerName);
    const scopes = options.scopes || provider.scopes;

    // Generate PKCE if required
    let codeVerifier: string | undefined;
    let codeChallenge: string | undefined;
    if (provider.authParams?.code_challenge_method === 'S256') {
      codeVerifier = await generateCodeVerifier();
      codeChallenge = await generateCodeChallenge(codeVerifier);
    }

    // Store state
    await this.config.stateStore.set(state, {
      provider: providerName,
      redirectUri,
      codeVerifier,
      returnTo: options.returnTo,
      createdAt: Date.now(),
    });

    // Build authorization URL
    const url = new URL(provider.authorizationUrl);
    url.searchParams.set('client_id', provider.clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', state);

    // Add PKCE params
    if (codeChallenge) {
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
    }

    // Add provider-specific params
    if (provider.authParams) {
      for (const [key, value] of Object.entries(provider.authParams)) {
        if (key !== 'code_challenge_method') {
          url.searchParams.set(key, value);
        }
      }
    }

    return url.toString();
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    ctx: VexorContext
  ): Promise<{ user: OAuthUser; returnTo?: string }> {
    const url = new URL(ctx.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      const errorDescription = url.searchParams.get('error_description');
      throw new OAuthError(error, errorDescription || undefined);
    }

    if (!code || !state) {
      throw new OAuthError('invalid_request', 'Missing code or state parameter');
    }

    // Verify state
    const stateData = await this.config.stateStore.get(state);
    if (!stateData) {
      throw new OAuthError('invalid_state', 'State not found or expired');
    }

    // Delete used state
    await this.config.stateStore.delete(state);

    const provider = this.config.providers[stateData.provider];
    if (!provider) {
      throw new OAuthError('invalid_provider', 'Provider not found');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCode(
      provider,
      code,
      stateData.redirectUri,
      stateData.codeVerifier
    );

    // Get user profile
    const profile = await this.getUserProfile(provider, tokens.accessToken);

    // Transform to user object
    const user = this.config.profileTransformer(stateData.provider, {
      ...profile,
      raw: profile.raw,
    });

    // Add tokens to user
    user.accessToken = tokens.accessToken;
    user.refreshToken = tokens.refreshToken;
    if (tokens.expiresIn) {
      user.expiresAt = Date.now() + tokens.expiresIn * 1000;
    }

    return { user, returnTo: stateData.returnTo };
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    providerName: string,
    refreshToken: string
  ): Promise<OAuthTokens> {
    const provider = this.config.providers[providerName];
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerName}`);
    }

    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new OAuthError(
        error.error || 'token_error',
        error.error_description || 'Failed to refresh token'
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
      idToken: data.id_token,
    };
  }

  /**
   * Get callback URL for a provider
   */
  getCallbackUrl(providerName: string): string {
    const path = this.config.callbackPath.replace('{provider}', providerName);
    return `${this.config.callbackBase}${path}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCode(
    provider: OAuthProvider,
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<OAuthTokens> {
    const body: Record<string, string> = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
    };

    if (codeVerifier) {
      body.code_verifier = codeVerifier;
    }

    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new OAuthError(
        error.error || 'token_error',
        error.error_description || 'Failed to exchange code for tokens'
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      scope: data.scope,
      idToken: data.id_token,
    };
  }

  /**
   * Get user profile from provider
   */
  private async getUserProfile(
    provider: OAuthProvider,
    accessToken: string
  ): Promise<OAuthProfile> {
    if (!provider.userInfoUrl) {
      throw new Error('User info URL not configured for this provider');
    }

    const response = await fetch(provider.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new OAuthError('profile_error', 'Failed to get user profile');
    }

    const data = await response.json();
    return parseProfile(provider.name, data);
  }
}

// ============================================================================
// Profile Parsers
// ============================================================================

function parseProfile(
  providerName: string,
  data: Record<string, unknown>
): OAuthProfile {
  switch (providerName) {
    case 'google':
      return {
        id: String(data.id),
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: data.picture as string | undefined,
        raw: data,
      };

    case 'github':
      return {
        id: String(data.id),
        email: data.email as string | undefined,
        name: (data.name || data.login) as string | undefined,
        picture: data.avatar_url as string | undefined,
        raw: data,
      };

    case 'discord':
      return {
        id: String(data.id),
        email: data.email as string | undefined,
        name: (data.global_name || data.username) as string | undefined,
        picture: data.avatar
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
          : undefined,
        raw: data,
      };

    case 'microsoft':
      return {
        id: String(data.id),
        email: data.mail as string | undefined,
        name: data.displayName as string | undefined,
        raw: data,
      };

    case 'facebook':
      const picture = data.picture as { data?: { url?: string } } | undefined;
      return {
        id: String(data.id),
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: picture?.data?.url,
        raw: data,
      };

    default:
      return {
        id: String(data.id || data.sub),
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: (data.picture || data.avatar_url || data.avatar) as string | undefined,
        raw: data,
      };
  }
}

function defaultProfileTransformer(
  provider: string,
  profile: OAuthProfile
): OAuthUser {
  return {
    id: profile.id,
    provider,
    email: profile.email,
    name: profile.name,
    avatar: profile.picture,
    accessToken: '',
    raw: profile.raw,
  };
}

// ============================================================================
// OAuth Error
// ============================================================================

export class OAuthError extends Error {
  constructor(
    public code: string,
    message?: string
  ) {
    super(message || code);
    this.name = 'OAuthError';
  }
}

// ============================================================================
// Middleware
// ============================================================================

/**
 * Create OAuth middleware that handles auth routes
 */
export function oauthMiddleware(oauth: OAuth) {
  return async (ctx: VexorContext): Promise<Response | void> => {
    const path = ctx.path;

    // Check if this is an OAuth route
    const loginMatch = path.match(/^\/auth\/(\w+)$/);
    const callbackMatch = path.match(/^\/auth\/(\w+)\/callback$/);

    if (loginMatch) {
      const provider = loginMatch[1];
      try {
        const url = await oauth.getAuthorizationUrl(provider, {
          returnTo: ctx.header('referer') || '/',
        });
        return Response.redirect(url, 302);
      } catch (error) {
        if (error instanceof Error) {
          return ctx.status(400).json({ error: error.message });
        }
        throw error;
      }
    }

    if (callbackMatch) {
      try {
        const { user, returnTo } = await oauth.handleCallback(ctx);

        // Store user in context
        (ctx as any).oauthUser = user;

        // You might want to create a session here or return user data
        // For now, we'll store it and let the app handle it
        return ctx.json({
          success: true,
          user: {
            id: user.id,
            provider: user.provider,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
          returnTo,
        });
      } catch (error) {
        if (error instanceof OAuthError) {
          return ctx.status(400).json({
            error: error.code,
            message: error.message,
          });
        }
        throw error;
      }
    }
  };
}

/**
 * Get OAuth user from context
 */
export function getOAuthUser(ctx: VexorContext): OAuthUser | undefined {
  return (ctx as any).oauthUser;
}
