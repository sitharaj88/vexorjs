/**
 * OAuth Module Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  OAuth,
  OAuthError,
  MemoryStateStore,
  providers,
  oauthMiddleware,
  getOAuthUser,
} from '../auth/oauth.js';
import type { OAuthProvider, OAuthConfig, OAuthStateData } from '../auth/oauth.js';
import { createMockContext } from './helpers.js';

// ============================================================================
// Provider Configuration
// ============================================================================

describe('providers', () => {
  describe('google', () => {
    it('should create a Google provider config', () => {
      const provider = providers.google('client-id', 'client-secret');
      expect(provider.name).toBe('google');
      expect(provider.clientId).toBe('client-id');
      expect(provider.clientSecret).toBe('client-secret');
      expect(provider.authorizationUrl).toContain('accounts.google.com');
      expect(provider.tokenUrl).toContain('googleapis.com');
      expect(provider.userInfoUrl).toContain('googleapis.com');
      expect(provider.scopes).toContain('openid');
      expect(provider.scopes).toContain('email');
      expect(provider.scopes).toContain('profile');
      expect(provider.authParams?.access_type).toBe('offline');
    });
  });

  describe('github', () => {
    it('should create a GitHub provider config', () => {
      const provider = providers.github('client-id', 'client-secret');
      expect(provider.name).toBe('github');
      expect(provider.clientId).toBe('client-id');
      expect(provider.clientSecret).toBe('client-secret');
      expect(provider.authorizationUrl).toContain('github.com');
      expect(provider.scopes).toContain('read:user');
      expect(provider.scopes).toContain('user:email');
    });
  });

  describe('discord', () => {
    it('should create a Discord provider config', () => {
      const provider = providers.discord('client-id', 'client-secret');
      expect(provider.name).toBe('discord');
      expect(provider.authorizationUrl).toContain('discord.com');
      expect(provider.scopes).toContain('identify');
    });
  });

  describe('twitter', () => {
    it('should create a Twitter provider config with PKCE', () => {
      const provider = providers.twitter('client-id', 'client-secret');
      expect(provider.name).toBe('twitter');
      expect(provider.authParams?.code_challenge_method).toBe('S256');
    });
  });

  describe('microsoft', () => {
    it('should create a Microsoft provider config with default tenant', () => {
      const provider = providers.microsoft('client-id', 'client-secret');
      expect(provider.name).toBe('microsoft');
      expect(provider.authorizationUrl).toContain('common');
    });

    it('should support custom tenant', () => {
      const provider = providers.microsoft('client-id', 'client-secret', 'my-tenant');
      expect(provider.authorizationUrl).toContain('my-tenant');
      expect(provider.tokenUrl).toContain('my-tenant');
    });
  });

  describe('facebook', () => {
    it('should create a Facebook provider config', () => {
      const provider = providers.facebook('client-id', 'client-secret');
      expect(provider.name).toBe('facebook');
      expect(provider.scopes).toContain('email');
      expect(provider.scopes).toContain('public_profile');
    });
  });

  describe('linkedin', () => {
    it('should create a LinkedIn provider config', () => {
      const provider = providers.linkedin('client-id', 'client-secret');
      expect(provider.name).toBe('linkedin');
      expect(provider.scopes).toContain('openid');
    });
  });

  describe('apple', () => {
    it('should create an Apple provider config', () => {
      const provider = providers.apple('client-id', 'client-secret');
      expect(provider.name).toBe('apple');
      expect(provider.authParams?.response_mode).toBe('form_post');
    });
  });
});

// ============================================================================
// MemoryStateStore
// ============================================================================

describe('MemoryStateStore', () => {
  let store: MemoryStateStore;

  beforeEach(() => {
    store = new MemoryStateStore(60);
  });

  it('should store and retrieve state data', async () => {
    const data: OAuthStateData = {
      provider: 'github',
      redirectUri: 'http://localhost/callback',
      createdAt: Date.now(),
    };

    await store.set('state123', data);
    const retrieved = await store.get('state123');

    expect(retrieved).toEqual(data);
  });

  it('should return null for non-existent state', async () => {
    const result = await store.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should delete state', async () => {
    const data: OAuthStateData = {
      provider: 'github',
      redirectUri: 'http://localhost/callback',
      createdAt: Date.now(),
    };

    await store.set('state123', data);
    await store.delete('state123');
    const result = await store.get('state123');

    expect(result).toBeNull();
  });

  it('should expire old states based on TTL', async () => {
    const expiredData: OAuthStateData = {
      provider: 'github',
      redirectUri: 'http://localhost/callback',
      createdAt: Date.now() - 120 * 1000, // 120 seconds ago, TTL is 60s
    };

    await store.set('expired', expiredData);
    const result = await store.get('expired');

    expect(result).toBeNull();
  });

  it('should return valid states within TTL', async () => {
    const validData: OAuthStateData = {
      provider: 'github',
      redirectUri: 'http://localhost/callback',
      createdAt: Date.now(),
    };

    await store.set('valid', validData);
    const result = await store.get('valid');

    expect(result).toEqual(validData);
  });
});

// ============================================================================
// OAuthError
// ============================================================================

describe('OAuthError', () => {
  it('should create error with code and message', () => {
    const error = new OAuthError('invalid_grant', 'Token expired');
    expect(error.code).toBe('invalid_grant');
    expect(error.message).toBe('Token expired');
    expect(error.name).toBe('OAuthError');
  });

  it('should use code as message when no message provided', () => {
    const error = new OAuthError('access_denied');
    expect(error.message).toBe('access_denied');
  });

  it('should be an instance of Error', () => {
    const error = new OAuthError('test');
    expect(error).toBeInstanceOf(Error);
  });
});

// ============================================================================
// OAuth Manager
// ============================================================================

describe('OAuth', () => {
  let oauth: OAuth;
  let githubProvider: OAuthProvider;

  beforeEach(() => {
    githubProvider = providers.github('test-client-id', 'test-client-secret');
    oauth = new OAuth({
      providers: { github: githubProvider },
      callbackBase: 'http://localhost:3000',
    });
  });

  describe('getCallbackUrl()', () => {
    it('should generate correct callback URL', () => {
      const url = oauth.getCallbackUrl('github');
      expect(url).toBe('http://localhost:3000/auth/github/callback');
    });

    it('should support custom callback path', () => {
      const customOauth = new OAuth({
        providers: { github: githubProvider },
        callbackBase: 'http://localhost:3000',
        callbackPath: '/oauth/{provider}/cb',
      });
      const url = customOauth.getCallbackUrl('github');
      expect(url).toBe('http://localhost:3000/oauth/github/cb');
    });
  });

  describe('getAuthorizationUrl()', () => {
    it('should generate authorization URL with required params', async () => {
      const url = await oauth.getAuthorizationUrl('github');
      const parsed = new URL(url);

      expect(parsed.origin + parsed.pathname).toBe('https://github.com/login/oauth/authorize');
      expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/github/callback');
      expect(parsed.searchParams.get('scope')).toBe('read:user user:email');
      expect(parsed.searchParams.get('state')).toBeDefined();
    });

    it('should store state in state store', async () => {
      const stateStore = new MemoryStateStore();
      const oauthWithStore = new OAuth({
        providers: { github: githubProvider },
        callbackBase: 'http://localhost:3000',
        stateStore,
      });

      const url = await oauthWithStore.getAuthorizationUrl('github');
      const parsed = new URL(url);
      const state = parsed.searchParams.get('state')!;

      const stateData = await stateStore.get(state);
      expect(stateData).not.toBeNull();
      expect(stateData?.provider).toBe('github');
    });

    it('should throw for unknown provider', async () => {
      await expect(oauth.getAuthorizationUrl('unknown')).rejects.toThrow(
        'Unknown OAuth provider: unknown'
      );
    });

    it('should support custom scopes', async () => {
      const url = await oauth.getAuthorizationUrl('github', {
        scopes: ['repo', 'gist'],
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get('scope')).toBe('repo gist');
    });

    it('should support custom state', async () => {
      const url = await oauth.getAuthorizationUrl('github', {
        state: 'my-custom-state',
      });
      const parsed = new URL(url);
      expect(parsed.searchParams.get('state')).toBe('my-custom-state');
    });

    it('should include provider-specific auth params', async () => {
      const googleProvider = providers.google('gid', 'gsecret');
      const googleOAuth = new OAuth({
        providers: { google: googleProvider },
        callbackBase: 'http://localhost:3000',
      });

      const url = await googleOAuth.getAuthorizationUrl('google');
      const parsed = new URL(url);
      expect(parsed.searchParams.get('access_type')).toBe('offline');
      expect(parsed.searchParams.get('prompt')).toBe('consent');
    });
  });

  describe('handleCallback()', () => {
    it('should throw OAuthError when error param is present', async () => {
      const ctx = createMockContext(
        'http://localhost:3000/auth/github/callback?error=access_denied&error_description=User+denied'
      );

      await expect(oauth.handleCallback(ctx)).rejects.toThrow(OAuthError);
      try {
        await oauth.handleCallback(ctx);
      } catch (e) {
        expect((e as OAuthError).code).toBe('access_denied');
      }
    });

    it('should throw OAuthError when code or state is missing', async () => {
      const ctx = createMockContext(
        'http://localhost:3000/auth/github/callback'
      );

      await expect(oauth.handleCallback(ctx)).rejects.toThrow(OAuthError);
    });

    it('should throw OAuthError when state is not found in store', async () => {
      const ctx = createMockContext(
        'http://localhost:3000/auth/github/callback?code=abc123&state=invalid-state'
      );

      await expect(oauth.handleCallback(ctx)).rejects.toThrow(OAuthError);
      try {
        await oauth.handleCallback(ctx);
      } catch (e) {
        expect((e as OAuthError).code).toBe('invalid_state');
      }
    });

    it('should exchange code for tokens and return user on success', async () => {
      // Set up state in state store
      const stateStore = new MemoryStateStore();
      await stateStore.set('valid-state', {
        provider: 'github',
        redirectUri: 'http://localhost:3000/auth/github/callback',
        createdAt: Date.now(),
      });

      const oauthWithStore = new OAuth({
        providers: { github: githubProvider },
        callbackBase: 'http://localhost:3000',
        stateStore,
      });

      // Mock fetch for token exchange and user profile
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              access_token: 'mock-token',
              token_type: 'bearer',
              scope: 'read:user',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              id: 12345,
              login: 'testuser',
              name: 'Test User',
              email: 'test@example.com',
              avatar_url: 'https://avatars.example.com/12345',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );

      try {
        const ctx = createMockContext(
          'http://localhost:3000/auth/github/callback?code=auth-code&state=valid-state'
        );

        const result = await oauthWithStore.handleCallback(ctx);

        expect(result.user).toBeDefined();
        expect(result.user.id).toBe('12345');
        expect(result.user.provider).toBe('github');
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.name).toBe('Test User');
        expect(result.user.accessToken).toBe('mock-token');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should delete used state after callback', async () => {
      const stateStore = new MemoryStateStore();
      await stateStore.set('one-time-state', {
        provider: 'github',
        redirectUri: 'http://localhost:3000/auth/github/callback',
        createdAt: Date.now(),
      });

      const oauthWithStore = new OAuth({
        providers: { github: githubProvider },
        callbackBase: 'http://localhost:3000',
        stateStore,
      });

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: 'tok', token_type: 'bearer' }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: 1, login: 'u' }), { status: 200 })
        );

      try {
        const ctx = createMockContext(
          'http://localhost:3000/auth/github/callback?code=abc&state=one-time-state'
        );
        await oauthWithStore.handleCallback(ctx);

        // State should be deleted
        const stateData = await stateStore.get('one-time-state');
        expect(stateData).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should throw OAuthError when token exchange fails', async () => {
      const stateStore = new MemoryStateStore();
      await stateStore.set('fail-state', {
        provider: 'github',
        redirectUri: 'http://localhost:3000/auth/github/callback',
        createdAt: Date.now(),
      });

      const oauthWithStore = new OAuth({
        providers: { github: githubProvider },
        callbackBase: 'http://localhost:3000',
        stateStore,
      });

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'bad_verification_code', error_description: 'Code expired' }),
          { status: 400 }
        )
      );

      try {
        const ctx = createMockContext(
          'http://localhost:3000/auth/github/callback?code=bad-code&state=fail-state'
        );
        await expect(oauthWithStore.handleCallback(ctx)).rejects.toThrow(OAuthError);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('refreshToken()', () => {
    it('should throw for unknown provider', async () => {
      await expect(
        oauth.refreshToken('nonexistent', 'token')
      ).rejects.toThrow('Unknown OAuth provider: nonexistent');
    });

    it('should exchange refresh token for new tokens', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            token_type: 'bearer',
            expires_in: 3600,
          }),
          { status: 200 }
        )
      );

      try {
        const tokens = await oauth.refreshToken('github', 'old-refresh-token');
        expect(tokens.accessToken).toBe('new-access-token');
        expect(tokens.refreshToken).toBe('new-refresh-token');
        expect(tokens.tokenType).toBe('bearer');
        expect(tokens.expiresIn).toBe(3600);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('should throw OAuthError when refresh fails', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'invalid_grant' }),
          { status: 400 }
        )
      );

      try {
        await expect(
          oauth.refreshToken('github', 'bad-token')
        ).rejects.toThrow(OAuthError);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});

// ============================================================================
// OAuth Middleware
// ============================================================================

describe('oauthMiddleware', () => {
  let oauth: OAuth;

  beforeEach(() => {
    oauth = new OAuth({
      providers: {
        github: providers.github('client-id', 'client-secret'),
      },
      callbackBase: 'http://localhost:3000',
    });
  });

  it('should redirect to authorization URL for /auth/:provider', async () => {
    const middleware = oauthMiddleware(oauth);
    const ctx = createMockContext('http://localhost:3000/auth/github');

    const response = await middleware(ctx);

    expect(response).toBeDefined();
    // The middleware returns Response.redirect which creates a redirect
    expect(response!.status).toBe(302);
    const location = response!.headers.get('location');
    expect(location).toContain('github.com/login/oauth/authorize');
  });

  it('should return 400 for unknown provider login', async () => {
    const middleware = oauthMiddleware(oauth);
    const ctx = createMockContext('http://localhost:3000/auth/unknown');

    const response = await middleware(ctx);

    expect(response).toBeDefined();
    expect(response!.status).toBe(400);
  });

  it('should return undefined for non-auth paths', async () => {
    const middleware = oauthMiddleware(oauth);
    const ctx = createMockContext('http://localhost:3000/other');

    const result = await middleware(ctx);
    expect(result).toBeUndefined();
  });
});

// ============================================================================
// getOAuthUser
// ============================================================================

describe('getOAuthUser', () => {
  it('should return undefined when no user is set', () => {
    const ctx = createMockContext('http://localhost/test');
    expect(getOAuthUser(ctx)).toBeUndefined();
  });

  it('should return user when set on context', () => {
    const ctx = createMockContext('http://localhost/test');
    const user = {
      id: '123',
      provider: 'github',
      email: 'test@example.com',
      name: 'Test',
      accessToken: 'token',
      raw: {},
    };
    (ctx as any).oauthUser = user;

    expect(getOAuthUser(ctx)).toEqual(user);
  });
});
