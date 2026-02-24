import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import InfoBlock from '../../components/InfoBlock';

const basicSetupCode = `import { Vexor } from '@vexorjs/core';
import { OAuth, oauthMiddleware, google, github } from '@vexorjs/core/auth';

const app = new Vexor();

// Configure OAuth with providers
const oauth = new OAuth({
  providers: {
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ['openid', 'email', 'profile'],
    }),
    github: github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scopes: ['user:email'],
    }),
  },
  callbackBase: 'https://example.com',
  callbackPath: '/auth/:provider/callback',
  stateTtl: 600, // 10 minutes for state parameter
});

// Register OAuth routes
app.use(oauthMiddleware(oauth));

// Start OAuth flow: redirect user to provider
// GET /auth/google  -> redirects to Google consent screen
// GET /auth/github  -> redirects to GitHub authorization page

// Handle callback: provider redirects back here
// GET /auth/google/callback?code=...&state=...
// GET /auth/github/callback?code=...&state=...`;

const googleLoginCode = `import { OAuth, google, getOAuthUser } from '@vexorjs/core/auth';
import type { OAuthUser } from '@vexorjs/core/auth';

const oauth = new OAuth({
  providers: {
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ['openid', 'email', 'profile'],
    }),
  },
  callbackBase: process.env.BASE_URL!,
});

// Initiate login: redirect to Google
app.get('/auth/google', async (ctx) => {
  const url = await oauth.getAuthorizationUrl('google', {
    state: crypto.randomUUID(),
    redirectUri: \`\${process.env.BASE_URL}/auth/google/callback\`,
  });
  return ctx.redirect(url);
});

// Handle Google callback
app.get('/auth/google/callback', async (ctx) => {
  const oauthUser: OAuthUser = await oauth.handleCallback(ctx);

  // oauthUser contains:
  // {
  //   id: '1234567890',
  //   provider: 'google',
  //   email: 'user@gmail.com',
  //   name: 'Jane Doe',
  //   avatar: 'https://lh3.googleusercontent.com/...',
  //   accessToken: 'ya29.a0...',
  //   refreshToken: '1//0e...',
  //   expiresAt: Date
  // }

  // Find or create user in your database
  let user = await db.select().from(users)
    .where(eq(users.oauthProvider, 'google'))
    .where(eq(users.oauthId, oauthUser.id))
    .first();

  if (!user) {
    user = await db.insert(users).values({
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.avatar,
      oauthProvider: 'google',
      oauthId: oauthUser.id,
    }).returning();
  }

  // Create session or JWT
  const token = await jwt.sign({ userId: user.id, role: user.role });
  return ctx.redirect(\`/dashboard?token=\${token}\`);
});`;

const githubLoginCode = `import { OAuth, github, getOAuthUser } from '@vexorjs/core/auth';

const oauth = new OAuth({
  providers: {
    github: github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scopes: ['user:email', 'read:user'],
    }),
  },
  callbackBase: process.env.BASE_URL!,
});

// Initiate GitHub login
app.get('/auth/github', async (ctx) => {
  const url = await oauth.getAuthorizationUrl('github', {
    state: crypto.randomUUID(),
  });
  return ctx.redirect(url);
});

// Handle GitHub callback
app.get('/auth/github/callback', async (ctx) => {
  try {
    const oauthUser = await oauth.handleCallback(ctx);

    // GitHub-specific: email may require additional API call if private
    const email = oauthUser.email ?? await fetchGitHubPrimaryEmail(oauthUser.accessToken);

    let user = await db.select().from(users)
      .where(eq(users.oauthProvider, 'github'))
      .where(eq(users.oauthId, oauthUser.id))
      .first();

    if (!user) {
      user = await db.insert(users).values({
        email,
        name: oauthUser.name,
        avatar: oauthUser.avatar,
        oauthProvider: 'github',
        oauthId: oauthUser.id,
      }).returning();
    }

    ctx.session.set('userId', user.id);
    return ctx.redirect('/dashboard');
  } catch (error) {
    console.error('GitHub OAuth failed:', error);
    return ctx.redirect('/login?error=oauth_failed');
  }
});`;

const callbackHandlerCode = `import { OAuth, getOAuthUser } from '@vexorjs/core/auth';
import type { OAuthUser, Context } from '@vexorjs/core/auth';

// Generic callback handler for any provider
async function handleOAuthCallback(ctx: Context, provider: string) {
  const oauthUser: OAuthUser = await oauth.handleCallback(ctx);

  // Upsert user in database
  let user = await db.select().from(users)
    .where(eq(users.oauthProvider, provider))
    .where(eq(users.oauthId, oauthUser.id))
    .first();

  if (user) {
    // Update existing user with latest profile info
    await db.update(users).set({
      name: oauthUser.name,
      avatar: oauthUser.avatar,
      lastLoginAt: new Date(),
    }).where(eq(users.id, user.id));
  } else {
    // Create new user
    user = await db.insert(users).values({
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.avatar,
      oauthProvider: provider,
      oauthId: oauthUser.id,
    }).returning();
  }

  // Store OAuth tokens for API access (e.g. GitHub API, Google Drive)
  await db.insert(oauthTokens).values({
    userId: user.id,
    provider,
    accessToken: oauthUser.accessToken,
    refreshToken: oauthUser.refreshToken,
    expiresAt: oauthUser.expiresAt,
  }).onConflict(['userId', 'provider'])
    .doUpdate({
      accessToken: oauthUser.accessToken,
      refreshToken: oauthUser.refreshToken,
      expiresAt: oauthUser.expiresAt,
    });

  return user;
}

// Use the generic handler for each provider
app.get('/auth/:provider/callback', async (ctx) => {
  const { provider } = ctx.params;
  const user = await handleOAuthCallback(ctx, provider);
  const token = await jwt.sign({ userId: user.id });
  return ctx.redirect(\`/dashboard?token=\${token}\`);
});`;

const profileTransformerCode = `import { OAuth, google, github, discord } from '@vexorjs/core/auth';
import type { OAuthUser } from '@vexorjs/core/auth';

const oauth = new OAuth({
  providers: {
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    github: github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    discord: discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  },
  callbackBase: process.env.BASE_URL!,

  // Transform the raw provider profile into a consistent shape
  profileTransformer: (provider: string, rawProfile: Record<string, unknown>): Partial<OAuthUser> => {
    switch (provider) {
      case 'google':
        return {
          email: rawProfile.email as string,
          name: rawProfile.name as string,
          avatar: rawProfile.picture as string,
        };
      case 'github':
        return {
          email: rawProfile.email as string,
          name: rawProfile.name as string ?? rawProfile.login as string,
          avatar: rawProfile.avatar_url as string,
        };
      case 'discord':
        const discordId = rawProfile.id as string;
        const discordAvatar = rawProfile.avatar as string;
        return {
          email: rawProfile.email as string,
          name: rawProfile.username as string,
          avatar: \`https://cdn.discordapp.com/avatars/\${discordId}/\${discordAvatar}.png\`,
        };
      default:
        return {};
    }
  },
});`;

const multipleProvidersCode = `import {
  OAuth, google, github, discord, twitter,
  microsoft, facebook, linkedin, apple,
} from '@vexorjs/core/auth';

const oauth = new OAuth({
  providers: {
    google: google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scopes: ['openid', 'email', 'profile'],
    }),
    github: github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scopes: ['user:email'],
    }),
    discord: discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scopes: ['identify', 'email'],
    }),
    twitter: twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    microsoft: microsoft({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenant: 'common',
    }),
    facebook: facebook({
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      scopes: ['email', 'public_profile'],
    }),
    linkedin: linkedin({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      scopes: ['openid', 'profile', 'email'],
    }),
    apple: apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      teamId: process.env.APPLE_TEAM_ID!,
      keyId: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!,
    }),
  },
  callbackBase: process.env.BASE_URL!,
  callbackPath: '/auth/:provider/callback',
  stateTtl: 600,
});

// Dynamic provider routes
app.get('/auth/:provider', async (ctx) => {
  const { provider } = ctx.params;
  const url = await oauth.getAuthorizationUrl(provider);
  return ctx.redirect(url);
});

app.get('/auth/:provider/callback', async (ctx) => {
  const { provider } = ctx.params;
  const oauthUser = await oauth.handleCallback(ctx);
  // ... create or update user
});

// Refresh a provider token
app.post('/auth/:provider/refresh', async (ctx) => {
  const { provider } = ctx.params;
  const storedToken = await getStoredRefreshToken(ctx.get('user').id, provider);
  const newTokens = await oauth.refreshToken(provider, storedToken);
  // ... update stored tokens
  return ctx.json({ expiresAt: newTokens.expiresAt });
});`;

export default function OAuthPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 id="oauth" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          OAuth2 & Social Login
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
          OAuth 2.0 is an authorization framework that allows users to grant your application limited
          access to their accounts on third-party services -- like Google, GitHub, or Discord --
          without sharing their passwords. Instead of managing credentials directly, your application
          delegates authentication to the provider and receives a time-limited access token in return.
          This is the technology behind every "Sign in with Google" button you have ever clicked.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's OAuth module handles the complex multi-step handshake that the OAuth 2.0
          Authorization Code flow requires. It generates cryptographically secure state parameters to
          prevent CSRF attacks, constructs provider-specific authorization URLs with the correct scopes,
          exchanges authorization codes for access tokens, fetches user profiles, and normalizes the
          wildly different response formats across providers into a consistent{' '}
          <code className="prose-code">OAuthUser</code> object. All you need to provide are your
          client credentials (obtained from each provider's developer console) and the business logic
          for creating or updating users in your database.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Understanding the OAuth flow at a conceptual level is important for debugging integration
          issues and making sound security decisions. The flow involves your application, the user's
          browser, and the provider's authorization server communicating in a precise sequence. Getting
          this sequence wrong -- for example, failing to validate the state parameter or using the
          implicit flow instead of the authorization code flow -- can introduce serious vulnerabilities.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          This page explains how the Authorization Code flow works step by step, why PKCE exists, the
          differences between providers, and how to implement social login with Vexor's built-in
          provider support for Google, GitHub, Discord, Twitter, Microsoft, Facebook, LinkedIn, and
          Apple.
        </p>
      </div>

      {/* How It Works */}
      <section>
        <h2 id="how-it-works" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          How the Authorization Code Flow Works
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The Authorization Code flow is the most secure OAuth 2.0 grant type for server-side
          applications. It proceeds in five distinct steps. First, your application redirects the
          user's browser to the provider's authorization endpoint, including your client ID, the
          requested scopes (permissions), a redirect URI, and a randomly generated{' '}
          <code className="prose-code">state</code> parameter. The state parameter is a CSRF
          token -- your application stores it temporarily and will verify it when the provider
          redirects back.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Second, the user sees the provider's consent screen, which displays your application's name
          and the permissions it is requesting. If the user approves, the provider redirects the
          browser back to your callback URL with two query parameters: an authorization{' '}
          <code className="prose-code">code</code> and the original <code className="prose-code">state</code>.
          The authorization code is a short-lived, single-use credential that your server must exchange
          for tokens within a few minutes.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Third, your server validates that the returned <code className="prose-code">state</code>{' '}
          matches the one it generated earlier. If the state does not match, the request is rejected
          as a potential CSRF attack. Fourth, your server makes a back-channel POST request to the
          provider's token endpoint, sending the authorization code, your client ID, and your client
          secret. The provider validates these credentials and responds with an access token (and
          optionally a refresh token). This back-channel exchange is critical because the client secret
          never passes through the browser, where it could be intercepted.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Fifth, your server uses the access token to call the provider's user info endpoint and
          retrieve the user's profile (email, name, avatar). Vexor's{' '}
          <code className="prose-code">handleCallback</code> method performs steps three through five
          in a single call, returning a normalized <code className="prose-code">OAuthUser</code>{' '}
          object that you can use to find or create a user in your database.
        </p>
        <InfoBlock variant="info">
          The <code className="prose-code">state</code> parameter is not optional. It is your primary
          defense against CSRF attacks in the OAuth flow. Vexor generates and validates it
          automatically, but if you implement custom OAuth flows, always include state validation.
        </InfoBlock>
      </section>

      {/* Why PKCE */}
      <section>
        <h2 id="pkce" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Why PKCE Exists
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          PKCE (Proof Key for Code Exchange, pronounced "pixie") is an extension to the Authorization
          Code flow that prevents authorization code interception attacks. In the standard flow, if
          an attacker can intercept the authorization code during the redirect (for example, via a
          malicious browser extension or a compromised redirect URI), they can exchange it for an
          access token using the stolen client secret. PKCE eliminates this risk by binding the
          authorization code to the specific client session that initiated the flow.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The mechanism works by having your application generate a random{' '}
          <code className="prose-code">code_verifier</code> string at the start of the flow and
          compute its SHA-256 hash, called the <code className="prose-code">code_challenge</code>.
          The challenge is sent with the authorization request. When exchanging the code for tokens,
          your application sends the original verifier. The provider hashes it and compares the result
          to the challenge it received earlier. An attacker who intercepts the authorization code does
          not have the original verifier and therefore cannot complete the token exchange.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          PKCE was originally designed for public clients (mobile apps and SPAs that cannot securely
          store a client secret), but modern security guidance recommends it for all clients, including
          server-side applications. Vexor's OAuth module supports PKCE transparently for providers that
          support it, and automatically falls back to the standard flow for providers that do not.
        </p>
      </section>

      {/* Provider Differences */}
      <section>
        <h2 id="provider-differences" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Provider Differences and Trade-offs
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Although all providers implement OAuth 2.0, the details vary significantly. Google uses
          OpenID Connect on top of OAuth 2.0, which means authentication information is included in a
          standardized ID token (a JWT) alongside the access token. This makes Google one of the
          easiest providers to integrate because the user's email and profile are available without a
          separate API call. GitHub, by contrast, returns only an opaque access token and requires you
          to call their <code className="prose-code">/user</code> API endpoint to retrieve profile data.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Scope naming conventions differ across providers. Google uses URI-style scopes like{' '}
          <code className="prose-code">openid</code> and <code className="prose-code">email</code>.
          GitHub uses colon-separated permission strings like <code className="prose-code">user:email</code>{' '}
          and <code className="prose-code">read:user</code>. Discord uses simple words like{' '}
          <code className="prose-code">identify</code> and <code className="prose-code">email</code>.
          Vexor's provider factory functions handle these differences internally, so you specify the
          scopes you want and the module translates them into the correct format for each provider.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Some providers have unique requirements. Apple Sign In requires a team ID, key ID, and a
          private key (not a client secret) because Apple uses JWT-based client authentication.
          Microsoft's Azure AD supports multi-tenant configurations via the{' '}
          <code className="prose-code">tenant</code> parameter. GitHub users can have private email
          addresses that require an additional API call to the{' '}
          <code className="prose-code">/user/emails</code> endpoint. Vexor's built-in provider
          functions encapsulate these quirks, but understanding them helps you debug issues when
          they arise.
        </p>
      </section>

      {/* Basic Setup */}
      <section>
        <h2 id="basic-setup" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Basic Setup
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Setting up OAuth in Vexor begins with creating an <code className="prose-code">OAuth</code>{' '}
          instance configured with your providers. Each provider requires a{' '}
          <code className="prose-code">clientId</code> and <code className="prose-code">clientSecret</code>{' '}
          obtained from the provider's developer console. The{' '}
          <code className="prose-code">callbackBase</code> is your application's public URL, which is
          combined with the <code className="prose-code">callbackPath</code> to form the full redirect
          URI registered with each provider.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">oauthMiddleware</code> helper is a convenience that
          automatically registers login and callback routes for each configured provider. When a user
          visits <code className="prose-code">/auth/google</code>, the middleware generates the
          authorization URL, stores the state parameter, and redirects the browser. When the provider
          redirects back to <code className="prose-code">/auth/google/callback</code>, the middleware
          validates the state, exchanges the code for tokens, and fetches the user profile.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">stateTtl</code> option controls how long a state parameter
          remains valid. The default of 600 seconds (10 minutes) gives the user enough time to
          complete the consent flow while limiting the window for replay attacks. If a state parameter
          expires before the callback arrives, the request is rejected.
        </p>
        <CodeBlock code={basicSetupCode} filename="src/auth.ts" />
        <InfoBlock variant="info">
          The <code className="prose-code">oauthMiddleware</code> helper automatically registers
          login and callback routes for each configured provider based on the{' '}
          <code className="prose-code">callbackPath</code> pattern.
        </InfoBlock>
      </section>

      {/* Google Login */}
      <section>
        <h2 id="google-login" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Google Login
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Google is the most commonly implemented OAuth provider. It supports OpenID Connect, which
          means you get an ID token containing the user's identity claims in addition to the standard
          access token. The <code className="prose-code">openid</code> scope is required to receive
          the ID token; <code className="prose-code">email</code> and{' '}
          <code className="prose-code">profile</code> add access to the user's email address and
          basic profile information (name, avatar) respectively.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When <code className="prose-code">handleCallback</code> processes a Google callback, it
          exchanges the authorization code for tokens via Google's token endpoint, then either
          decodes the ID token or calls the userinfo endpoint to retrieve the user's profile. The
          result is a normalized <code className="prose-code">OAuthUser</code> object with consistent
          field names regardless of the underlying provider response format.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          After receiving the user profile, the typical pattern is to look up the user by their
          provider-specific ID (not their email, since emails can change). If no matching user exists,
          create one. Then establish an application session -- either by signing a JWT or creating a
          server-side session -- and redirect the user to your dashboard.
        </p>
        <CodeBlock code={googleLoginCode} filename="src/routes/auth.ts" />
      </section>

      {/* GitHub Login */}
      <section>
        <h2 id="github-login" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          GitHub Login
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          GitHub's OAuth implementation has a notable quirk: the user's email address may not be
          included in the standard profile response if they have set their email to private. The{' '}
          <code className="prose-code">user:email</code> scope grants access to the user's email
          addresses, but you may need to make a separate API call to the{' '}
          <code className="prose-code">/user/emails</code> endpoint to retrieve the primary,
          verified email address.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Unlike Google, GitHub does not issue refresh tokens by default. GitHub's access tokens have
          no expiration unless you enable the token expiration beta feature in your GitHub App settings.
          This means that for most GitHub integrations, you receive a single access token that remains
          valid until the user revokes your application's access. This simplifies token management but
          means you should be prepared to handle 401 responses from the GitHub API and prompt the user
          to re-authorize when necessary.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The example below shows a defensive pattern that gracefully handles the case where the email
          is not included in the initial profile response. It falls back to an explicit API call to
          fetch the user's primary email, ensuring that your user record always has a valid email
          address even when the user's GitHub privacy settings are restrictive.
        </p>
        <CodeBlock code={githubLoginCode} filename="src/routes/auth.ts" />
        <InfoBlock variant="tip">
          GitHub users can have a private email. Use the{' '}
          <code className="prose-code">user:email</code> scope and call the{' '}
          <code className="prose-code">/user/emails</code> GitHub API endpoint if{' '}
          <code className="prose-code">oauthUser.email</code> is null.
        </InfoBlock>
      </section>

      {/* Handling Callbacks */}
      <section>
        <h2 id="handling-callbacks" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Handling Callbacks
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          As you add more providers, you will notice that the callback logic is nearly identical
          across all of them: validate the OAuth response, look up or create a user, store the
          provider's tokens for future API access, and establish an application session. Extracting
          this into a generic callback handler eliminates duplication and ensures consistent behavior
          across all providers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The pattern below uses a dynamic route parameter (<code className="prose-code">:provider</code>)
          to handle callbacks for any provider with a single route. The generic handler performs an
          upsert operation: if the user already exists (matched by provider and provider-specific ID),
          it updates their profile information with the latest data from the provider. If the user is
          new, it creates a full account record. This ensures that profile changes (like a new avatar
          or display name) are reflected in your application automatically.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Storing the provider's access and refresh tokens is important if your application needs to
          make API calls on behalf of the user -- for example, accessing their Google Drive files or
          reading their GitHub repositories. The tokens should be stored encrypted or in a secure
          database, and the refresh token should be used to obtain new access tokens when they expire.
        </p>
        <CodeBlock code={callbackHandlerCode} filename="src/routes/auth.ts" />
      </section>

      {/* Profile Transformer */}
      <section>
        <h2 id="profile-transformer" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Profile Transformer
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every OAuth provider returns user profile data in a different format. Google returns the
          avatar in a field called <code className="prose-code">picture</code>, GitHub uses{' '}
          <code className="prose-code">avatar_url</code>, and Discord requires constructing the
          avatar URL from an ID and hash. The display name might be in{' '}
          <code className="prose-code">name</code>, <code className="prose-code">login</code>, or{' '}
          <code className="prose-code">username</code> depending on the provider. This inconsistency
          makes it difficult to write provider-agnostic code.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vexor's built-in provider functions handle the most common field mappings automatically,
          but the <code className="prose-code">profileTransformer</code> option gives you full
          control over how raw provider responses are mapped to the{' '}
          <code className="prose-code">OAuthUser</code> shape. This is particularly useful when
          you need to extract provider-specific fields that the default transformer does not cover,
          or when you want to apply custom logic like falling back to a login name when the display
          name is not set.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The transformer receives the provider name and the raw profile object as returned by the
          provider's API. You return a partial <code className="prose-code">OAuthUser</code> with the
          fields you want to override. Fields you do not include will use the default transformer's
          values. This layered approach means you only need to customize the fields that differ from
          the defaults.
        </p>
        <CodeBlock code={profileTransformerCode} filename="src/auth.ts" />
      </section>

      {/* Multiple Providers */}
      <section>
        <h2 id="multiple-providers" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Multiple Providers
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Most production applications offer several social login options to maximize user convenience.
          Vexor supports registering all providers in a single <code className="prose-code">OAuth</code>{' '}
          instance, and the dynamic route pattern (<code className="prose-code">:provider</code>)
          means you only need one login route and one callback route to handle any number of providers.
          The module validates that the provider name in the route parameter matches a configured
          provider and rejects requests for unknown providers.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When supporting multiple providers, consider the account linking problem: what happens when
          the same user signs in with Google one day and GitHub the next? If you match users solely by
          provider and provider ID, you will create two separate accounts. A common solution is to
          also match by verified email address -- if a user signs in with a new provider but their
          email matches an existing account, link the new provider to the existing account rather than
          creating a duplicate.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The <code className="prose-code">refreshToken</code> method allows you to obtain new access
          tokens for a specific provider without requiring the user to re-authorize. This is
          essential for applications that make ongoing API calls to provider services (for example,
          syncing calendar events from Google or posting status updates to Discord). Store the
          refresh token securely and use it to maintain continuous access.
        </p>
        <CodeBlock code={multipleProvidersCode} filename="src/auth.ts" />
        <InfoBlock variant="warning">
          Apple Sign In requires additional configuration (team ID, key ID, and a private key)
          compared to other providers. Follow Apple's documentation to generate the required credentials.
        </InfoBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Best Practices
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          OAuth integration touches both security and user experience. These guidelines help you
          avoid common pitfalls.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>Always validate the state parameter.</strong> Skipping state validation opens
            your application to CSRF attacks where an attacker can force a victim to link their
            account to the attacker's OAuth identity.
          </li>
          <li>
            <strong>Request minimal scopes.</strong> Only ask for the permissions your application
            actually needs. Broad scope requests reduce user trust and may trigger additional
            review processes from providers.
          </li>
          <li>
            <strong>Match users by provider ID, not email.</strong> Email addresses can change.
            The provider-specific user ID is stable and should be your primary lookup key.
          </li>
          <li>
            <strong>Handle account linking carefully.</strong> When a user signs in with a new
            provider, check whether their email matches an existing account and offer to link rather
            than creating a duplicate.
          </li>
          <li>
            <strong>Store OAuth tokens securely.</strong> If you persist access or refresh tokens
            for ongoing API access, encrypt them at rest and restrict database access to the
            services that need them.
          </li>
          <li>
            <strong>Implement error handling for callbacks.</strong> Providers can return error codes
            instead of authorization codes if the user denies consent or something goes wrong.
            Always handle the error case gracefully and redirect the user to a meaningful error page.
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section>
        <h2 id="api-reference" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Configuration options for the <code className="prose-code">OAuth</code> constructor. All
          provider-specific options (clientId, clientSecret, scopes) are configured through the
          individual provider factory functions.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">providers</code></td>
                <td className="py-3 px-4"><code className="prose-code">Record&lt;string, OAuthProvider&gt;</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">A map of provider names to provider configurations created by factory functions like google(), github(), and discord(). The key becomes the provider identifier used in route parameters and database records. At least one provider is required.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">callbackBase</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">The public base URL of your application (e.g., 'https://example.com'). This is combined with callbackPath to form the full redirect URI registered with each provider. Must match the redirect URI configured in the provider's developer console exactly.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">callbackPath</code></td>
                <td className="py-3 px-4"><code className="prose-code">string</code></td>
                <td className="py-3 px-4"><code className="prose-code">'/auth/:provider/callback'</code></td>
                <td className="py-3 px-4">The URL pattern for OAuth callback routes. The :provider segment is replaced with the provider name when generating redirect URIs. Customize this if your application uses a different routing convention.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">stateStore</code></td>
                <td className="py-3 px-4"><code className="prose-code">StateStore</code></td>
                <td className="py-3 px-4">In-memory</td>
                <td className="py-3 px-4">The storage backend for CSRF state tokens generated during the OAuth flow. Defaults to an in-memory store suitable for single-instance deployments. Use a Redis or database store in production when running multiple instances to ensure state tokens are accessible across all nodes.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">sessionStore</code></td>
                <td className="py-3 px-4"><code className="prose-code">SessionStore</code></td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4">An optional session store for persisting OAuth flow state (code verifiers, nonces) across the redirect. If not provided, state is stored in the stateStore. Useful when you want to share the same session infrastructure used for application sessions.</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code className="prose-code">stateTtl</code></td>
                <td className="py-3 px-4"><code className="prose-code">number</code></td>
                <td className="py-3 px-4"><code className="prose-code">600</code></td>
                <td className="py-3 px-4">The time-to-live in seconds for state parameters (default 10 minutes). If the user does not complete the OAuth flow within this window, the callback is rejected. Increase this value if your users are on slow networks or your provider's consent screen is complex.</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code className="prose-code">profileTransformer</code></td>
                <td className="py-3 px-4"><code className="prose-code">(provider, raw) =&gt; Partial&lt;OAuthUser&gt;</code></td>
                <td className="py-3 px-4">Built-in</td>
                <td className="py-3 px-4">A custom function that maps raw provider profile responses into the OAuthUser shape. Receives the provider name and the raw profile object. Return a partial OAuthUser to override specific fields; unset fields use the built-in defaults. Use this to handle non-standard fields or apply custom normalization logic.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Next Steps */}
      <section className="card bg-slate-50 dark:bg-slate-800/50">
        <h2 id="next" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Next Steps
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/auth/security" className="btn-primary">
            Security Best Practices <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/auth/sessions" className="btn-secondary">
            Session Management
          </Link>
        </div>
      </section>
    </div>
  );
}
