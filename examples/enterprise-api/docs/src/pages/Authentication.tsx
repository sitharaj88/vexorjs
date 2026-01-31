import { EndpointCard } from '../components/EndpointCard';
import { CodeBlock } from '../components/CodeBlock';
import { Key, RefreshCw, LogOut, User, Lock } from 'lucide-react';

const tokenFlowCode = `// 1. User logs in and receives tokens
const { accessToken, refreshToken } = await login(email, password);

// 2. Use access token for API requests
fetch('/api/protected', {
  headers: { 'Authorization': \`Bearer \${accessToken}\` }
});

// 3. When access token expires, use refresh token to get new tokens
const newTokens = await refreshTokens(refreshToken);

// 4. On logout, invalidate refresh token
await logout(refreshToken);`;

export function Authentication() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Authentication
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        JWT-based authentication with access and refresh tokens.
      </p>

      {/* Token Flow */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Token Flow
        </h2>
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Key, title: 'Login', desc: 'Get tokens' },
            { icon: User, title: 'Access', desc: 'Use access token' },
            { icon: RefreshCw, title: 'Refresh', desc: 'Renew tokens' },
            { icon: LogOut, title: 'Logout', desc: 'Invalidate' },
          ].map((step, i) => (
            <div key={step.title} className="relative text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              {i < 3 && (
                <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-300 dark:bg-slate-600" />
              )}
              <step.icon className="mx-auto mb-2 text-primary-500" size={24} />
              <p className="font-medium text-slate-900 dark:text-white text-sm">{step.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
        <CodeBlock code={tokenFlowCode} language="typescript" />
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Endpoints
        </h2>

        <div className="space-y-4">
          <EndpointCard
            method="POST"
            path="/auth/register"
            description="Register a new user account"
            requestBody={`{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}`}
            responseBody={`{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 3600
  }
}`}
            parameters={[
              { name: 'email', type: 'string', required: true, description: 'Valid email address (unique)' },
              { name: 'password', type: 'string', required: true, description: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special' },
              { name: 'name', type: 'string', required: true, description: 'User display name (min 2 characters)' },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/auth/login"
            description="Authenticate with email and password"
            requestBody={`{
  "email": "user@example.com",
  "password": "SecurePass123!"
}`}
            responseBody={`{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "a1b2c3d4e5f6...",
    "expiresIn": 3600
  }
}`}
            parameters={[
              { name: 'email', type: 'string', required: true, description: 'Registered email address' },
              { name: 'password', type: 'string', required: true, description: 'Account password' },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/auth/refresh"
            description="Get new access token using refresh token"
            requestBody={`{
  "refreshToken": "a1b2c3d4e5f6..."
}`}
            responseBody={`{
  "message": "Token refreshed",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "new-refresh-token...",
    "expiresIn": 3600
  }
}`}
            parameters={[
              { name: 'refreshToken', type: 'string', required: true, description: 'Valid refresh token from login' },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/auth/logout"
            description="Invalidate a refresh token"
            requestBody={`{
  "refreshToken": "a1b2c3d4e5f6..."
}`}
            responseBody={`{
  "message": "Logout successful"
}`}
            parameters={[
              { name: 'refreshToken', type: 'string', required: false, description: 'Refresh token to invalidate' },
            ]}
          />

          <EndpointCard
            method="POST"
            path="/auth/logout-all"
            description="Invalidate all refresh tokens for the user (logout from all devices)"
            auth="required"
            responseBody={`{
  "message": "Logged out from all devices"
}`}
          />

          <EndpointCard
            method="GET"
            path="/auth/me"
            description="Get the currently authenticated user's profile"
            auth="required"
            responseBody={`{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}`}
          />

          <EndpointCard
            method="POST"
            path="/auth/change-password"
            description="Change the current user's password"
            auth="required"
            requestBody={`{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}`}
            responseBody={`{
  "message": "Password changed successfully"
}`}
            parameters={[
              { name: 'currentPassword', type: 'string', required: true, description: 'Current account password' },
              { name: 'newPassword', type: 'string', required: true, description: 'New password (same requirements as registration)' },
            ]}
          />
        </div>
      </section>

      {/* Password Requirements */}
      <section className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <Lock className="text-primary-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Password Requirements
            </h3>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>• Minimum 8 characters</li>
              <li>• At least 1 uppercase letter (A-Z)</li>
              <li>• At least 1 lowercase letter (a-z)</li>
              <li>• At least 1 number (0-9)</li>
              <li>• At least 1 special character (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
