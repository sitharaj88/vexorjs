import { CodeBlock } from '../components/CodeBlock';
import { Shield, Lock, Clock, Globe, AlertTriangle } from 'lucide-react';

const passwordHashingCode = `import { randomBytes, pbkdf2, timingSafeEqual } from 'crypto';

// Configuration
const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

// Hash password
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return \`\${salt.toString('hex')}:\${ITERATIONS}:\${hash.toString('hex')}\`;
}

// Verify password (timing-safe)
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, iterations, hashHex] = stored.split(':');
  const hash = await pbkdf2Async(password, Buffer.from(saltHex, 'hex'), parseInt(iterations), ...);
  return timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}`;

const jwtCode = `// Access Token (short-lived)
{
  "userId": 1,
  "email": "user@example.com",
  "role": "admin",
  "iat": 1705312200,
  "exp": 1705315800  // Expires in 1 hour
}

// Refresh Token (long-lived, stored in database)
// Random 64-character hex string
"a1b2c3d4e5f6..."`;

const rateLimitCode = `// Rate limit middleware configuration
const rateLimit = {
  windowMs: 60000,      // 1 minute window
  maxRequests: 100,     // 100 requests per window
  keyGenerator: (ctx) => ctx.ip,  // Key by IP address
};

// Stricter limits for auth endpoints
const authRateLimit = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 5,            // Only 5 attempts
};

// Response headers
// X-RateLimit-Limit: 100
// X-RateLimit-Remaining: 95
// X-RateLimit-Reset: 1705312260`;

const corsCode = `// CORS middleware configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,  // Cache preflight for 24 hours
}));`;

const securityFeatures = [
  {
    icon: Lock,
    title: 'Password Hashing',
    description: 'PBKDF2 with SHA-512, 100,000 iterations, and 32-byte salt',
  },
  {
    icon: Shield,
    title: 'JWT Authentication',
    description: 'Short-lived access tokens with long-lived refresh tokens',
  },
  {
    icon: Clock,
    title: 'Rate Limiting',
    description: 'Per-IP request throttling with stricter limits for auth endpoints',
  },
  {
    icon: Globe,
    title: 'CORS Protection',
    description: 'Configurable cross-origin resource sharing',
  },
];

export function Security() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Security
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Security features and best practices implemented in the Enterprise API.
      </p>

      {/* Security Features Grid */}
      <section className="mb-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="text-primary-500" size={24} />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Password Hashing */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Password Hashing
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Passwords are hashed using PBKDF2 with the following parameters:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 mb-4 space-y-1">
          <li><strong>Algorithm:</strong> SHA-512</li>
          <li><strong>Iterations:</strong> 100,000</li>
          <li><strong>Salt Length:</strong> 32 bytes (256 bits)</li>
          <li><strong>Key Length:</strong> 64 bytes (512 bits)</li>
        </ul>
        <CodeBlock code={passwordHashingCode} language="typescript" />
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            <strong>Timing-safe comparison</strong> is used to prevent timing attacks when verifying passwords.
          </p>
        </div>
      </section>

      {/* JWT Tokens */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          JWT Token Strategy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The API uses a dual-token strategy for secure session management:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Access Token</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Short-lived (1 hour default)</li>
              <li>• Contains user ID, email, role</li>
              <li>• Sent with every API request</li>
              <li>• Stateless validation</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Refresh Token</h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Long-lived (7 days default)</li>
              <li>• Random 64-char hex string</li>
              <li>• Stored in database</li>
              <li>• Can be revoked</li>
            </ul>
          </div>
        </div>
        <CodeBlock code={jwtCode} language="json" />
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Rate Limiting
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Request rate limiting protects against abuse and brute-force attacks:
        </p>
        <CodeBlock code={rateLimitCode} language="typescript" />
      </section>

      {/* CORS */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          CORS Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cross-Origin Resource Sharing is configured to protect against unauthorized access:
        </p>
        <CodeBlock code={corsCode} language="typescript" />
      </section>

      {/* Best Practices */}
      <section className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
              Production Security Checklist
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Use a strong, unique <code className="font-mono bg-amber-100 dark:bg-amber-800/50 px-1 rounded">JWT_SECRET</code> (minimum 32 characters)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Set <code className="font-mono bg-amber-100 dark:bg-amber-800/50 px-1 rounded">CORS_ORIGIN</code> to your actual domain(s)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Use HTTPS in production (not handled by this API directly)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Consider shorter access token expiration (15m instead of 1h)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Enable audit logging for sensitive operations</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Regularly rotate the JWT secret</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Never commit <code className="font-mono bg-amber-100 dark:bg-amber-800/50 px-1 rounded">.env</code> files to version control</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
