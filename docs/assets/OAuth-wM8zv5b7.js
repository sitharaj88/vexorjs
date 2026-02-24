import{j as e,I as s,C as t,L as r,A as a}from"./index-BWrueqsD.js";const o=`import { Vexor } from '@vexorjs/core';
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
// GET /auth/github/callback?code=...&state=...`,i=`import { OAuth, google, getOAuthUser } from '@vexorjs/core/auth';
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
});`,n=`import { OAuth, github, getOAuthUser } from '@vexorjs/core/auth';

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
});`,c=`import { OAuth, getOAuthUser } from '@vexorjs/core/auth';
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
});`,l=`import { OAuth, google, github, discord } from '@vexorjs/core/auth';
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
});`,d=`import {
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
});`;function p(){return e.jsxs("div",{className:"space-y-12",children:[e.jsxs("div",{children:[e.jsx("h1",{id:"oauth",className:"text-4xl font-bold text-slate-900 dark:text-white mb-4",children:"OAuth2 & Social Login"}),e.jsx("p",{className:"text-lg text-slate-600 dark:text-slate-400 mb-4",children:'OAuth 2.0 is an authorization framework that allows users to grant your application limited access to their accounts on third-party services -- like Google, GitHub, or Discord -- without sharing their passwords. Instead of managing credentials directly, your application delegates authentication to the provider and receives a time-limited access token in return. This is the technology behind every "Sign in with Google" button you have ever clicked.'}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's OAuth module handles the complex multi-step handshake that the OAuth 2.0 Authorization Code flow requires. It generates cryptographically secure state parameters to prevent CSRF attacks, constructs provider-specific authorization URLs with the correct scopes, exchanges authorization codes for access tokens, fetches user profiles, and normalizes the wildly different response formats across providers into a consistent"," ",e.jsx("code",{className:"prose-code",children:"OAuthUser"})," object. All you need to provide are your client credentials (obtained from each provider's developer console) and the business logic for creating or updating users in your database."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Understanding the OAuth flow at a conceptual level is important for debugging integration issues and making sound security decisions. The flow involves your application, the user's browser, and the provider's authorization server communicating in a precise sequence. Getting this sequence wrong -- for example, failing to validate the state parameter or using the implicit flow instead of the authorization code flow -- can introduce serious vulnerabilities."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400",children:"This page explains how the Authorization Code flow works step by step, why PKCE exists, the differences between providers, and how to implement social login with Vexor's built-in provider support for Google, GitHub, Discord, Twitter, Microsoft, Facebook, LinkedIn, and Apple."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"how-it-works",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"How the Authorization Code Flow Works"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The Authorization Code flow is the most secure OAuth 2.0 grant type for server-side applications. It proceeds in five distinct steps. First, your application redirects the user's browser to the provider's authorization endpoint, including your client ID, the requested scopes (permissions), a redirect URI, and a randomly generated"," ",e.jsx("code",{className:"prose-code",children:"state"})," parameter. The state parameter is a CSRF token -- your application stores it temporarily and will verify it when the provider redirects back."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Second, the user sees the provider's consent screen, which displays your application's name and the permissions it is requesting. If the user approves, the provider redirects the browser back to your callback URL with two query parameters: an authorization"," ",e.jsx("code",{className:"prose-code",children:"code"})," and the original ",e.jsx("code",{className:"prose-code",children:"state"}),". The authorization code is a short-lived, single-use credential that your server must exchange for tokens within a few minutes."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Third, your server validates that the returned ",e.jsx("code",{className:"prose-code",children:"state"})," ","matches the one it generated earlier. If the state does not match, the request is rejected as a potential CSRF attack. Fourth, your server makes a back-channel POST request to the provider's token endpoint, sending the authorization code, your client ID, and your client secret. The provider validates these credentials and responds with an access token (and optionally a refresh token). This back-channel exchange is critical because the client secret never passes through the browser, where it could be intercepted."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Fifth, your server uses the access token to call the provider's user info endpoint and retrieve the user's profile (email, name, avatar). Vexor's"," ",e.jsx("code",{className:"prose-code",children:"handleCallback"})," method performs steps three through five in a single call, returning a normalized ",e.jsx("code",{className:"prose-code",children:"OAuthUser"})," ","object that you can use to find or create a user in your database."]}),e.jsxs(s,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"state"})," parameter is not optional. It is your primary defense against CSRF attacks in the OAuth flow. Vexor generates and validates it automatically, but if you implement custom OAuth flows, always include state validation."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"pkce",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Why PKCE Exists"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:'PKCE (Proof Key for Code Exchange, pronounced "pixie") is an extension to the Authorization Code flow that prevents authorization code interception attacks. In the standard flow, if an attacker can intercept the authorization code during the redirect (for example, via a malicious browser extension or a compromised redirect URI), they can exchange it for an access token using the stolen client secret. PKCE eliminates this risk by binding the authorization code to the specific client session that initiated the flow.'}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The mechanism works by having your application generate a random"," ",e.jsx("code",{className:"prose-code",children:"code_verifier"})," string at the start of the flow and compute its SHA-256 hash, called the ",e.jsx("code",{className:"prose-code",children:"code_challenge"}),". The challenge is sent with the authorization request. When exchanging the code for tokens, your application sends the original verifier. The provider hashes it and compares the result to the challenge it received earlier. An attacker who intercepts the authorization code does not have the original verifier and therefore cannot complete the token exchange."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"PKCE was originally designed for public clients (mobile apps and SPAs that cannot securely store a client secret), but modern security guidance recommends it for all clients, including server-side applications. Vexor's OAuth module supports PKCE transparently for providers that support it, and automatically falls back to the standard flow for providers that do not."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"provider-differences",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Provider Differences and Trade-offs"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Although all providers implement OAuth 2.0, the details vary significantly. Google uses OpenID Connect on top of OAuth 2.0, which means authentication information is included in a standardized ID token (a JWT) alongside the access token. This makes Google one of the easiest providers to integrate because the user's email and profile are available without a separate API call. GitHub, by contrast, returns only an opaque access token and requires you to call their ",e.jsx("code",{className:"prose-code",children:"/user"})," API endpoint to retrieve profile data."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Scope naming conventions differ across providers. Google uses URI-style scopes like"," ",e.jsx("code",{className:"prose-code",children:"openid"})," and ",e.jsx("code",{className:"prose-code",children:"email"}),". GitHub uses colon-separated permission strings like ",e.jsx("code",{className:"prose-code",children:"user:email"})," ","and ",e.jsx("code",{className:"prose-code",children:"read:user"}),". Discord uses simple words like"," ",e.jsx("code",{className:"prose-code",children:"identify"})," and ",e.jsx("code",{className:"prose-code",children:"email"}),". Vexor's provider factory functions handle these differences internally, so you specify the scopes you want and the module translates them into the correct format for each provider."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Some providers have unique requirements. Apple Sign In requires a team ID, key ID, and a private key (not a client secret) because Apple uses JWT-based client authentication. Microsoft's Azure AD supports multi-tenant configurations via the"," ",e.jsx("code",{className:"prose-code",children:"tenant"})," parameter. GitHub users can have private email addresses that require an additional API call to the"," ",e.jsx("code",{className:"prose-code",children:"/user/emails"})," endpoint. Vexor's built-in provider functions encapsulate these quirks, but understanding them helps you debug issues when they arise."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"basic-setup",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Basic Setup"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Setting up OAuth in Vexor begins with creating an ",e.jsx("code",{className:"prose-code",children:"OAuth"})," ","instance configured with your providers. Each provider requires a"," ",e.jsx("code",{className:"prose-code",children:"clientId"})," and ",e.jsx("code",{className:"prose-code",children:"clientSecret"})," ","obtained from the provider's developer console. The"," ",e.jsx("code",{className:"prose-code",children:"callbackBase"})," is your application's public URL, which is combined with the ",e.jsx("code",{className:"prose-code",children:"callbackPath"})," to form the full redirect URI registered with each provider."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"oauthMiddleware"})," helper is a convenience that automatically registers login and callback routes for each configured provider. When a user visits ",e.jsx("code",{className:"prose-code",children:"/auth/google"}),", the middleware generates the authorization URL, stores the state parameter, and redirects the browser. When the provider redirects back to ",e.jsx("code",{className:"prose-code",children:"/auth/google/callback"}),", the middleware validates the state, exchanges the code for tokens, and fetches the user profile."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"stateTtl"})," option controls how long a state parameter remains valid. The default of 600 seconds (10 minutes) gives the user enough time to complete the consent flow while limiting the window for replay attacks. If a state parameter expires before the callback arrives, the request is rejected."]}),e.jsx(t,{code:o,filename:"src/auth.ts"}),e.jsxs(s,{variant:"info",children:["The ",e.jsx("code",{className:"prose-code",children:"oauthMiddleware"})," helper automatically registers login and callback routes for each configured provider based on the"," ",e.jsx("code",{className:"prose-code",children:"callbackPath"})," pattern."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"google-login",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Google Login"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Google is the most commonly implemented OAuth provider. It supports OpenID Connect, which means you get an ID token containing the user's identity claims in addition to the standard access token. The ",e.jsx("code",{className:"prose-code",children:"openid"})," scope is required to receive the ID token; ",e.jsx("code",{className:"prose-code",children:"email"})," and"," ",e.jsx("code",{className:"prose-code",children:"profile"})," add access to the user's email address and basic profile information (name, avatar) respectively."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["When ",e.jsx("code",{className:"prose-code",children:"handleCallback"})," processes a Google callback, it exchanges the authorization code for tokens via Google's token endpoint, then either decodes the ID token or calls the userinfo endpoint to retrieve the user's profile. The result is a normalized ",e.jsx("code",{className:"prose-code",children:"OAuthUser"})," object with consistent field names regardless of the underlying provider response format."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"After receiving the user profile, the typical pattern is to look up the user by their provider-specific ID (not their email, since emails can change). If no matching user exists, create one. Then establish an application session -- either by signing a JWT or creating a server-side session -- and redirect the user to your dashboard."}),e.jsx(t,{code:i,filename:"src/routes/auth.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"github-login",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"GitHub Login"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["GitHub's OAuth implementation has a notable quirk: the user's email address may not be included in the standard profile response if they have set their email to private. The"," ",e.jsx("code",{className:"prose-code",children:"user:email"})," scope grants access to the user's email addresses, but you may need to make a separate API call to the"," ",e.jsx("code",{className:"prose-code",children:"/user/emails"})," endpoint to retrieve the primary, verified email address."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Unlike Google, GitHub does not issue refresh tokens by default. GitHub's access tokens have no expiration unless you enable the token expiration beta feature in your GitHub App settings. This means that for most GitHub integrations, you receive a single access token that remains valid until the user revokes your application's access. This simplifies token management but means you should be prepared to handle 401 responses from the GitHub API and prompt the user to re-authorize when necessary."}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"The example below shows a defensive pattern that gracefully handles the case where the email is not included in the initial profile response. It falls back to an explicit API call to fetch the user's primary email, ensuring that your user record always has a valid email address even when the user's GitHub privacy settings are restrictive."}),e.jsx(t,{code:n,filename:"src/routes/auth.ts"}),e.jsxs(s,{variant:"tip",children:["GitHub users can have a private email. Use the"," ",e.jsx("code",{className:"prose-code",children:"user:email"})," scope and call the"," ",e.jsx("code",{className:"prose-code",children:"/user/emails"})," GitHub API endpoint if"," ",e.jsx("code",{className:"prose-code",children:"oauthUser.email"})," is null."]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"handling-callbacks",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Handling Callbacks"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"As you add more providers, you will notice that the callback logic is nearly identical across all of them: validate the OAuth response, look up or create a user, store the provider's tokens for future API access, and establish an application session. Extracting this into a generic callback handler eliminates duplication and ensures consistent behavior across all providers."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The pattern below uses a dynamic route parameter (",e.jsx("code",{className:"prose-code",children:":provider"}),") to handle callbacks for any provider with a single route. The generic handler performs an upsert operation: if the user already exists (matched by provider and provider-specific ID), it updates their profile information with the latest data from the provider. If the user is new, it creates a full account record. This ensures that profile changes (like a new avatar or display name) are reflected in your application automatically."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"Storing the provider's access and refresh tokens is important if your application needs to make API calls on behalf of the user -- for example, accessing their Google Drive files or reading their GitHub repositories. The tokens should be stored encrypted or in a secure database, and the refresh token should be used to obtain new access tokens when they expire."}),e.jsx(t,{code:c,filename:"src/routes/auth.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"profile-transformer",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Profile Transformer"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Every OAuth provider returns user profile data in a different format. Google returns the avatar in a field called ",e.jsx("code",{className:"prose-code",children:"picture"}),", GitHub uses"," ",e.jsx("code",{className:"prose-code",children:"avatar_url"}),", and Discord requires constructing the avatar URL from an ID and hash. The display name might be in"," ",e.jsx("code",{className:"prose-code",children:"name"}),", ",e.jsx("code",{className:"prose-code",children:"login"}),", or"," ",e.jsx("code",{className:"prose-code",children:"username"})," depending on the provider. This inconsistency makes it difficult to write provider-agnostic code."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Vexor's built-in provider functions handle the most common field mappings automatically, but the ",e.jsx("code",{className:"prose-code",children:"profileTransformer"})," option gives you full control over how raw provider responses are mapped to the"," ",e.jsx("code",{className:"prose-code",children:"OAuthUser"})," shape. This is particularly useful when you need to extract provider-specific fields that the default transformer does not cover, or when you want to apply custom logic like falling back to a login name when the display name is not set."]}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The transformer receives the provider name and the raw profile object as returned by the provider's API. You return a partial ",e.jsx("code",{className:"prose-code",children:"OAuthUser"})," with the fields you want to override. Fields you do not include will use the default transformer's values. This layered approach means you only need to customize the fields that differ from the defaults."]}),e.jsx(t,{code:l,filename:"src/auth.ts"})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"multiple-providers",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Multiple Providers"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Most production applications offer several social login options to maximize user convenience. Vexor supports registering all providers in a single ",e.jsx("code",{className:"prose-code",children:"OAuth"})," ","instance, and the dynamic route pattern (",e.jsx("code",{className:"prose-code",children:":provider"}),") means you only need one login route and one callback route to handle any number of providers. The module validates that the provider name in the route parameter matches a configured provider and rejects requests for unknown providers."]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"When supporting multiple providers, consider the account linking problem: what happens when the same user signs in with Google one day and GitHub the next? If you match users solely by provider and provider ID, you will create two separate accounts. A common solution is to also match by verified email address -- if a user signs in with a new provider but their email matches an existing account, link the new provider to the existing account rather than creating a duplicate."}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["The ",e.jsx("code",{className:"prose-code",children:"refreshToken"})," method allows you to obtain new access tokens for a specific provider without requiring the user to re-authorize. This is essential for applications that make ongoing API calls to provider services (for example, syncing calendar events from Google or posting status updates to Discord). Store the refresh token securely and use it to maintain continuous access."]}),e.jsx(t,{code:d,filename:"src/auth.ts"}),e.jsx(s,{variant:"warning",children:"Apple Sign In requires additional configuration (team ID, key ID, and a private key) compared to other providers. Follow Apple's documentation to generate the required credentials."})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"best-practices",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"Best Practices"}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:"OAuth integration touches both security and user experience. These guidelines help you avoid common pitfalls."}),e.jsxs("ul",{className:"list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Always validate the state parameter."})," Skipping state validation opens your application to CSRF attacks where an attacker can force a victim to link their account to the attacker's OAuth identity."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Request minimal scopes."})," Only ask for the permissions your application actually needs. Broad scope requests reduce user trust and may trigger additional review processes from providers."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Match users by provider ID, not email."})," Email addresses can change. The provider-specific user ID is stable and should be your primary lookup key."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Handle account linking carefully."})," When a user signs in with a new provider, check whether their email matches an existing account and offer to link rather than creating a duplicate."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Store OAuth tokens securely."})," If you persist access or refresh tokens for ongoing API access, encrypt them at rest and restrict database access to the services that need them."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Implement error handling for callbacks."})," Providers can return error codes instead of authorization codes if the user denies consent or something goes wrong. Always handle the error case gracefully and redirect the user to a meaningful error page."]})]})]}),e.jsxs("section",{children:[e.jsx("h2",{id:"api-reference",className:"text-2xl font-bold text-slate-900 dark:text-white mb-4",children:"API Reference"}),e.jsxs("p",{className:"text-slate-600 dark:text-slate-400 mb-4",children:["Configuration options for the ",e.jsx("code",{className:"prose-code",children:"OAuth"})," constructor. All provider-specific options (clientId, clientSecret, scopes) are configured through the individual provider factory functions."]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Option"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Type"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Default"}),e.jsx("th",{className:"text-left py-3 px-4 font-semibold text-slate-900 dark:text-white",children:"Description"})]})}),e.jsxs("tbody",{className:"text-slate-600 dark:text-slate-400",children:[e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"providers"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"Record<string, OAuthProvider>"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"A map of provider names to provider configurations created by factory functions like google(), github(), and discord(). The key becomes the provider identifier used in route parameters and database records. At least one provider is required."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"callbackBase"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"The public base URL of your application (e.g., 'https://example.com'). This is combined with callbackPath to form the full redirect URI registered with each provider. Must match the redirect URI configured in the provider's developer console exactly."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"callbackPath"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"string"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"'/auth/:provider/callback'"})}),e.jsx("td",{className:"py-3 px-4",children:"The URL pattern for OAuth callback routes. The :provider segment is replaced with the provider name when generating redirect URIs. Customize this if your application uses a different routing convention."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"stateStore"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"StateStore"})}),e.jsx("td",{className:"py-3 px-4",children:"In-memory"}),e.jsx("td",{className:"py-3 px-4",children:"The storage backend for CSRF state tokens generated during the OAuth flow. Defaults to an in-memory store suitable for single-instance deployments. Use a Redis or database store in production when running multiple instances to ensure state tokens are accessible across all nodes."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"sessionStore"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"SessionStore"})}),e.jsx("td",{className:"py-3 px-4",children:"-"}),e.jsx("td",{className:"py-3 px-4",children:"An optional session store for persisting OAuth flow state (code verifiers, nonces) across the redirect. If not provided, state is stored in the stateStore. Useful when you want to share the same session infrastructure used for application sessions."})]}),e.jsxs("tr",{className:"border-b border-slate-200 dark:border-slate-700",children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"stateTtl"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"number"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"600"})}),e.jsx("td",{className:"py-3 px-4",children:"The time-to-live in seconds for state parameters (default 10 minutes). If the user does not complete the OAuth flow within this window, the callback is rejected. Increase this value if your users are on slow networks or your provider's consent screen is complex."})]}),e.jsxs("tr",{children:[e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"profileTransformer"})}),e.jsx("td",{className:"py-3 px-4",children:e.jsx("code",{className:"prose-code",children:"(provider, raw) => Partial<OAuthUser>"})}),e.jsx("td",{className:"py-3 px-4",children:"Built-in"}),e.jsx("td",{className:"py-3 px-4",children:"A custom function that maps raw provider profile responses into the OAuthUser shape. Receives the provider name and the raw profile object. Return a partial OAuthUser to override specific fields; unset fields use the built-in defaults. Use this to handle non-standard fields or apply custom normalization logic."})]})]})]})})]}),e.jsxs("section",{className:"card bg-slate-50 dark:bg-slate-800/50",children:[e.jsx("h2",{id:"next",className:"text-xl font-bold text-slate-900 dark:text-white mb-4",children:"Next Steps"}),e.jsxs("div",{className:"flex flex-wrap gap-3",children:[e.jsxs(r,{to:"/auth/security",className:"btn-primary",children:["Security Best Practices ",e.jsx(a,{className:"w-4 h-4 ml-2"})]}),e.jsx(r,{to:"/auth/sessions",className:"btn-secondary",children:"Session Management"})]})]})]})}export{p as default};
