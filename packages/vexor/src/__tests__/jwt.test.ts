/**
 * JWT Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { JWT, JWTError, sign, verify, decode, generateJti } from '../auth/jwt.js';

describe('JWT', () => {
  const secret = 'super-secret-key-for-testing-purposes';

  describe('constructor', () => {
    it('should throw if HMAC algorithm is used without a secret', () => {
      expect(() => new JWT({ algorithm: 'HS256' })).toThrow(
        'Secret is required for HMAC algorithms'
      );
    });

    it('should throw for HS384 without secret', () => {
      expect(() => new JWT({ algorithm: 'HS384' })).toThrow(
        'Secret is required for HMAC algorithms'
      );
    });

    it('should throw for RS256 without any key', () => {
      expect(() => new JWT({ algorithm: 'RS256' })).toThrow(
        'Private or public key is required for RSA algorithms'
      );
    });

    it('should default to HS256 algorithm', async () => {
      const jwt = new JWT({ secret });
      const token = await jwt.sign({ sub: 'user1' });
      const decoded = jwt.decode(token);
      expect(decoded?.header.alg).toBe('HS256');
    });
  });

  describe('sign/verify round-trip', () => {
    it('should sign and verify a token with HS256', async () => {
      const jwt = new JWT({ secret });
      const payload = { sub: 'user123', name: 'Alice' };

      const token = await jwt.sign(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const result = await jwt.verify(token);
      expect(result.payload.sub).toBe('user123');
      expect(result.payload.name).toBe('Alice');
      expect(result.protectedHeader.alg).toBe('HS256');
      expect(result.protectedHeader.typ).toBe('JWT');
    });
  });

  describe('sign', () => {
    it('should include iat automatically', async () => {
      const jwt = new JWT({ secret });
      const beforeSign = Math.floor(Date.now() / 1000);

      const token = await jwt.sign({ sub: 'user1' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.iat).toBeDefined();
      expect(decoded!.payload.iat).toBeGreaterThanOrEqual(beforeSign);
      expect(decoded!.payload.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
    });

    it('should add exp from expiresIn as seconds', async () => {
      const jwt = new JWT({ secret, expiresIn: 3600 });
      const now = Math.floor(Date.now() / 1000);

      const token = await jwt.sign({ sub: 'user1' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.exp).toBeDefined();
      // exp should be approximately now + 3600
      expect(decoded!.payload.exp).toBeGreaterThanOrEqual(now + 3599);
      expect(decoded!.payload.exp).toBeLessThanOrEqual(now + 3601);
    });

    it('should add exp from expiresIn as string like "1h"', async () => {
      const jwt = new JWT({ secret, expiresIn: '1h' });
      const now = Math.floor(Date.now() / 1000);

      const token = await jwt.sign({ sub: 'user1' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.exp).toBeDefined();
      expect(decoded!.payload.exp).toBeGreaterThanOrEqual(now + 3599);
      expect(decoded!.payload.exp).toBeLessThanOrEqual(now + 3601);
    });

    it('should add iss from options.issuer', async () => {
      const jwt = new JWT({ secret, issuer: 'test-app' });
      const token = await jwt.sign({ sub: 'user1' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.iss).toBe('test-app');
    });

    it('should add aud from options.audience', async () => {
      const jwt = new JWT({ secret, audience: 'my-api' });
      const token = await jwt.sign({ sub: 'user1' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.aud).toBe('my-api');
    });

    it('should not override iss if already in payload', async () => {
      const jwt = new JWT({ secret, issuer: 'default-issuer' });
      const token = await jwt.sign({ sub: 'user1', iss: 'custom-issuer' });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.iss).toBe('custom-issuer');
    });

    it('should not override exp if already in payload', async () => {
      const jwt = new JWT({ secret, expiresIn: 3600 });
      const customExp = Math.floor(Date.now() / 1000) + 7200;
      const token = await jwt.sign({ sub: 'user1', exp: customExp });

      const decoded = jwt.decode(token);
      expect(decoded?.payload.exp).toBe(customExp);
    });
  });

  describe('verify', () => {
    it('should throw EXPIRED for expired tokens', async () => {
      const jwt = new JWT({ secret });
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      const token = await jwt.sign({ sub: 'user1', exp: pastExp });

      await expect(jwt.verify(token)).rejects.toThrow(JWTError);
      await expect(jwt.verify(token)).rejects.toMatchObject({
        code: 'EXPIRED',
      });
    });

    it('should throw NOT_BEFORE for future nbf', async () => {
      const jwt = new JWT({ secret });
      const futureNbf = Math.floor(Date.now() / 1000) + 3600;
      const token = await jwt.sign({ sub: 'user1', nbf: futureNbf });

      await expect(jwt.verify(token)).rejects.toThrow(JWTError);
      await expect(jwt.verify(token)).rejects.toMatchObject({
        code: 'NOT_BEFORE',
      });
    });

    it('should throw INVALID_SIGNATURE for tampered token', async () => {
      const jwt = new JWT({ secret });
      const token = await jwt.sign({ sub: 'user1' });

      // Sign a different payload with the same JWT instance, then swap signatures
      const token2 = await jwt.sign({ sub: 'user2' });
      const parts1 = token.split('.');
      const parts2 = token2.split('.');

      // Use token1's header+payload with token2's signature
      const tamperedToken = `${parts1[0]}.${parts1[1]}.${parts2[2]}`;

      await expect(jwt.verify(tamperedToken)).rejects.toThrow(JWTError);
      await expect(jwt.verify(tamperedToken)).rejects.toMatchObject({
        code: 'INVALID_SIGNATURE',
      });
    });

    it('should throw INVALID_CLAIM for wrong issuer', async () => {
      const signer = new JWT({ secret });
      const verifier = new JWT({ secret, issuer: 'expected-issuer' });

      const token = await signer.sign({ sub: 'user1', iss: 'wrong-issuer' });

      await expect(verifier.verify(token)).rejects.toThrow(JWTError);
      await expect(verifier.verify(token)).rejects.toMatchObject({
        code: 'INVALID_CLAIM',
      });
    });

    it('should throw INVALID_CLAIM for wrong audience', async () => {
      const signer = new JWT({ secret });
      const verifier = new JWT({ secret, audience: 'expected-aud' });

      const token = await signer.sign({ sub: 'user1', aud: 'wrong-aud' });

      await expect(verifier.verify(token)).rejects.toThrow(JWTError);
      await expect(verifier.verify(token)).rejects.toMatchObject({
        code: 'INVALID_CLAIM',
      });
    });

    it('should respect clockTolerance for expired tokens', async () => {
      const jwt = new JWT({ secret, clockTolerance: 60 });
      // Token expired 30 seconds ago, but tolerance is 60s
      const recentExp = Math.floor(Date.now() / 1000) - 30;
      const token = await jwt.sign({ sub: 'user1', exp: recentExp });

      const result = await jwt.verify(token);
      expect(result.payload.sub).toBe('user1');
    });

    it('should respect clockTolerance for nbf', async () => {
      const jwt = new JWT({ secret, clockTolerance: 60 });
      // nbf is 30 seconds in the future, but tolerance is 60s
      const nearNbf = Math.floor(Date.now() / 1000) + 30;
      const token = await jwt.sign({ sub: 'user1', nbf: nearNbf });

      const result = await jwt.verify(token);
      expect(result.payload.sub).toBe('user1');
    });

    it('should throw INVALID_TOKEN for invalid token format', async () => {
      const jwt = new JWT({ secret });

      await expect(jwt.verify('not-a-token')).rejects.toThrow(JWTError);
      await expect(jwt.verify('not-a-token')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
      });
    });

    it('should verify token signed with different secret fails', async () => {
      const signer = new JWT({ secret: 'key-one' });
      const verifier = new JWT({ secret: 'key-two' });

      const token = await signer.sign({ sub: 'user1' });

      await expect(verifier.verify(token)).rejects.toMatchObject({
        code: 'INVALID_SIGNATURE',
      });
    });
  });

  describe('verify timing-safe HMAC (Bug 2 fix)', () => {
    it('should use crypto.subtle.verify for constant-time comparison', async () => {
      // This test verifies the implementation uses crypto.subtle.verify
      // instead of a manual comparison, which provides timing-safe HMAC verification.
      const verifySpy = vi.spyOn(crypto.subtle, 'verify');

      const jwt = new JWT({ secret });
      const token = await jwt.sign({ sub: 'user1' });
      await jwt.verify(token);

      expect(verifySpy).toHaveBeenCalled();
      // Check it was called with HMAC algorithm
      const call = verifySpy.mock.calls.find(
        (c) => c[0] === 'HMAC' || (c[0] as any)?.name === 'HMAC'
      );
      expect(call).toBeDefined();

      verifySpy.mockRestore();
    });
  });

  describe('decode', () => {
    it('should decode without verification', async () => {
      const jwt = new JWT({ secret });
      const token = await jwt.sign({ sub: 'user1', role: 'admin' });

      const decoded = jwt.decode(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.header.alg).toBe('HS256');
      expect(decoded!.header.typ).toBe('JWT');
      expect(decoded!.payload.sub).toBe('user1');
      expect(decoded!.payload.role).toBe('admin');
      expect(typeof decoded!.signature).toBe('string');
    });

    it('should return null for invalid format', () => {
      const jwt = new JWT({ secret });

      expect(jwt.decode('not-a-jwt')).toBeNull();
      expect(jwt.decode('only.two')).toBeNull();
      expect(jwt.decode('')).toBeNull();
    });

    it('should return null for malformed base64', () => {
      const jwt = new JWT({ secret });
      expect(jwt.decode('!!!.!!!.!!!')).toBeNull();
    });
  });

  describe('standalone helpers', () => {
    it('sign() and verify() helper functions work', async () => {
      const token = await sign({ sub: 'user1' }, { secret });
      const result = await verify(token, { secret });
      expect(result.payload.sub).toBe('user1');
    });

    it('decode() helper function works', async () => {
      const token = await sign({ sub: 'user1' }, { secret });
      const decoded = decode(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.payload.sub).toBe('user1');
    });

    it('decode() returns null for invalid format', () => {
      expect(decode('invalid')).toBeNull();
      expect(decode('a.b')).toBeNull();
    });
  });

  describe('generateJti', () => {
    it('should return a string', () => {
      const jti = generateJti();
      expect(typeof jti).toBe('string');
      expect(jti.length).toBeGreaterThan(0);
    });

    it('should return unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateJti());
      }
      expect(ids.size).toBe(100);
    });
  });
});
