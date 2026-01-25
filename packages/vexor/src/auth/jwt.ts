/**
 * JWT Authentication
 *
 * Secure JWT token creation, verification, and middleware.
 * Uses Web Crypto API for cross-runtime compatibility.
 */

/**
 * JWT algorithm types
 */
export type JWTAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

/**
 * JWT header
 */
export interface JWTHeader {
  alg: JWTAlgorithm;
  typ: 'JWT';
}

/**
 * JWT payload (standard claims)
 */
export interface JWTPayload {
  /** Issuer */
  iss?: string;
  /** Subject */
  sub?: string;
  /** Audience */
  aud?: string | string[];
  /** Expiration time (Unix timestamp) */
  exp?: number;
  /** Not before (Unix timestamp) */
  nbf?: number;
  /** Issued at (Unix timestamp) */
  iat?: number;
  /** JWT ID */
  jti?: string;
  /** Custom claims */
  [key: string]: unknown;
}

/**
 * JWT options
 */
export interface JWTOptions {
  /** Secret key for HMAC algorithms */
  secret?: string;
  /** Public key for RSA algorithms (verification) */
  publicKey?: string;
  /** Private key for RSA algorithms (signing) */
  privateKey?: string;
  /** Algorithm to use */
  algorithm?: JWTAlgorithm;
  /** Token expiration (in seconds or string like '1h', '7d') */
  expiresIn?: number | string;
  /** Issuer claim */
  issuer?: string;
  /** Audience claim */
  audience?: string | string[];
  /** Clock tolerance for expiration (in seconds) */
  clockTolerance?: number;
}

/**
 * Decode result
 */
export interface JWTDecodeResult {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

/**
 * Verify result
 */
export interface JWTVerifyResult {
  payload: JWTPayload;
  protectedHeader: JWTHeader;
}

/**
 * JWT error types
 */
export class JWTError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TOKEN' | 'EXPIRED' | 'NOT_BEFORE' | 'INVALID_SIGNATURE' | 'INVALID_CLAIM'
  ) {
    super(message);
    this.name = 'JWTError';
  }
}

/**
 * Base64URL encode
 */
function base64UrlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Get HMAC algorithm config
 */
function getHmacAlgorithm(alg: JWTAlgorithm): { name: string; hash: string } {
  switch (alg) {
    case 'HS256': return { name: 'HMAC', hash: 'SHA-256' };
    case 'HS384': return { name: 'HMAC', hash: 'SHA-384' };
    case 'HS512': return { name: 'HMAC', hash: 'SHA-512' };
    default: throw new Error(`Unsupported HMAC algorithm: ${alg}`);
  }
}

/**
 * Get RSA algorithm config
 */
function getRsaAlgorithm(alg: JWTAlgorithm): { name: string; hash: string } {
  switch (alg) {
    case 'RS256': return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    case 'RS384': return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' };
    case 'RS512': return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' };
    default: throw new Error(`Unsupported RSA algorithm: ${alg}`);
  }
}

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') return duration;

  const match = duration.match(/^(\d+)(s|m|h|d|w)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    case 'w': return value * 60 * 60 * 24 * 7;
    default: return value;
  }
}

/**
 * JWT class for signing and verifying tokens
 */
export class JWT {
  private options: Required<Pick<JWTOptions, 'algorithm' | 'clockTolerance'>> &
    Omit<JWTOptions, 'algorithm' | 'clockTolerance'>;

  constructor(options: JWTOptions = {}) {
    this.options = {
      algorithm: options.algorithm ?? 'HS256',
      clockTolerance: options.clockTolerance ?? 0,
      ...options,
    };

    // Validate required keys
    if (this.options.algorithm.startsWith('HS') && !this.options.secret) {
      throw new Error('Secret is required for HMAC algorithms');
    }
    if (this.options.algorithm.startsWith('RS') && !this.options.privateKey && !this.options.publicKey) {
      throw new Error('Private or public key is required for RSA algorithms');
    }
  }

  /**
   * Sign a JWT token
   */
  async sign(payload: JWTPayload): Promise<string> {
    const header: JWTHeader = {
      alg: this.options.algorithm,
      typ: 'JWT',
    };

    // Build payload with standard claims
    const now = Math.floor(Date.now() / 1000);
    const finalPayload: JWTPayload = {
      ...payload,
      iat: payload.iat ?? now,
    };

    if (this.options.issuer && !payload.iss) {
      finalPayload.iss = this.options.issuer;
    }

    if (this.options.audience && !payload.aud) {
      finalPayload.aud = this.options.audience;
    }

    if (this.options.expiresIn && !payload.exp) {
      const expiresInSeconds = parseDuration(this.options.expiresIn);
      finalPayload.exp = now + expiresInSeconds;
    }

    // Encode header and payload
    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(finalPayload));
    const signingInput = `${headerEncoded}.${payloadEncoded}`;

    // Sign
    const signature = await this.createSignature(signingInput);

    return `${signingInput}.${signature}`;
  }

  /**
   * Verify a JWT token
   */
  async verify(token: string): Promise<JWTVerifyResult> {
    const decoded = this.decode(token);
    if (!decoded) {
      throw new JWTError('Invalid token format', 'INVALID_TOKEN');
    }

    const { header, payload, signature } = decoded;

    // Verify algorithm
    if (header.alg !== this.options.algorithm) {
      throw new JWTError(`Algorithm mismatch: expected ${this.options.algorithm}, got ${header.alg}`, 'INVALID_TOKEN');
    }

    // Verify signature
    const parts = token.split('.');
    const signingInput = `${parts[0]}.${parts[1]}`;
    const isValid = await this.verifySignature(signingInput, signature);

    if (!isValid) {
      throw new JWTError('Invalid signature', 'INVALID_SIGNATURE');
    }

    // Verify claims
    const now = Math.floor(Date.now() / 1000);

    // Check expiration
    if (payload.exp !== undefined) {
      if (now > payload.exp + this.options.clockTolerance) {
        throw new JWTError('Token has expired', 'EXPIRED');
      }
    }

    // Check not before
    if (payload.nbf !== undefined) {
      if (now < payload.nbf - this.options.clockTolerance) {
        throw new JWTError('Token is not yet valid', 'NOT_BEFORE');
      }
    }

    // Check issuer
    if (this.options.issuer && payload.iss !== this.options.issuer) {
      throw new JWTError(`Invalid issuer: expected ${this.options.issuer}, got ${payload.iss}`, 'INVALID_CLAIM');
    }

    // Check audience
    if (this.options.audience) {
      const audiences = Array.isArray(this.options.audience) ? this.options.audience : [this.options.audience];
      const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      const hasValidAudience = audiences.some((aud) => tokenAudiences.includes(aud));
      if (!hasValidAudience) {
        throw new JWTError('Invalid audience', 'INVALID_CLAIM');
      }
    }

    return {
      payload,
      protectedHeader: header,
    };
  }

  /**
   * Decode a JWT without verification
   */
  decode(token: string): JWTDecodeResult | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0]))) as JWTHeader;
      const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as JWTPayload;
      const signature = parts[2];

      return { header, payload, signature };
    } catch {
      return null;
    }
  }

  /**
   * Create signature
   */
  private async createSignature(data: string): Promise<string> {
    const algorithm = this.options.algorithm;

    if (algorithm.startsWith('HS')) {
      return this.signHmac(data);
    } else if (algorithm.startsWith('RS')) {
      return this.signRsa(data);
    }

    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  /**
   * Verify signature
   */
  private async verifySignature(data: string, signature: string): Promise<boolean> {
    const algorithm = this.options.algorithm;

    if (algorithm.startsWith('HS')) {
      const expected = await this.signHmac(data);
      return signature === expected;
    } else if (algorithm.startsWith('RS')) {
      return this.verifyRsa(data, signature);
    }

    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  /**
   * HMAC signing
   */
  private async signHmac(data: string): Promise<string> {
    const { name, hash } = getHmacAlgorithm(this.options.algorithm);
    const secretBytes = new TextEncoder().encode(this.options.secret!);

    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name, hash },
      false,
      ['sign']
    );

    const dataBytes = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(name, key, dataBytes);

    return base64UrlEncode(new Uint8Array(signature));
  }

  /**
   * RSA signing
   */
  private async signRsa(data: string): Promise<string> {
    if (!this.options.privateKey) {
      throw new Error('Private key is required for signing');
    }

    const { name, hash } = getRsaAlgorithm(this.options.algorithm);

    // Import private key (PEM format)
    const keyData = this.pemToArrayBuffer(this.options.privateKey, 'PRIVATE');
    const key = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name, hash },
      false,
      ['sign']
    );

    const dataBytes = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(name, key, dataBytes);

    return base64UrlEncode(new Uint8Array(signature));
  }

  /**
   * RSA verification
   */
  private async verifyRsa(data: string, signature: string): Promise<boolean> {
    const keyPem = this.options.publicKey || this.options.privateKey;
    if (!keyPem) {
      throw new Error('Public or private key is required for verification');
    }

    const { name, hash } = getRsaAlgorithm(this.options.algorithm);

    // Import public key (PEM format)
    const isPublic = keyPem.includes('PUBLIC');
    const keyData = this.pemToArrayBuffer(keyPem, isPublic ? 'PUBLIC' : 'PRIVATE');

    const key = await crypto.subtle.importKey(
      isPublic ? 'spki' : 'pkcs8',
      keyData,
      { name, hash },
      false,
      isPublic ? ['verify'] : ['sign']
    );

    const dataBytes = new TextEncoder().encode(data);
    const signatureBytes = base64UrlDecode(signature);

    return crypto.subtle.verify(name, key, signatureBytes.buffer as ArrayBuffer, dataBytes);
  }

  /**
   * Convert PEM to ArrayBuffer
   */
  private pemToArrayBuffer(pem: string, type: 'PUBLIC' | 'PRIVATE'): ArrayBuffer {
    const header = type === 'PUBLIC' ? '-----BEGIN PUBLIC KEY-----' : '-----BEGIN PRIVATE KEY-----';
    const footer = type === 'PUBLIC' ? '-----END PUBLIC KEY-----' : '-----END PRIVATE KEY-----';

    const base64 = pem
      .replace(header, '')
      .replace(footer, '')
      .replace(/[\r\n\s]/g, '');

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Create JWT instance
 */
export function createJWT(options: JWTOptions): JWT {
  return new JWT(options);
}

/**
 * Quick sign helper
 */
export async function sign(payload: JWTPayload, options: JWTOptions): Promise<string> {
  const jwt = new JWT(options);
  return jwt.sign(payload);
}

/**
 * Quick verify helper
 */
export async function verify(token: string, options: JWTOptions): Promise<JWTVerifyResult> {
  const jwt = new JWT(options);
  return jwt.verify(token);
}

/**
 * Quick decode helper (no verification)
 */
export function decode(token: string): JWTDecodeResult | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0]))) as JWTHeader;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1]))) as JWTPayload;
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
}

/**
 * Generate a random JWT ID
 */
export function generateJti(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
