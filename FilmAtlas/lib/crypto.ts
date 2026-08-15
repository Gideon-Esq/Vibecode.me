import 'server-only';

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      'ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32'
    );
  }

  const key = Buffer.from(secret, 'base64');
  if (key.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must decode to exactly 32 bytes. Generate one with: openssl rand -base64 32'
    );
  }
  return key;
}

/**
 * Encrypts a TMDB session id for storage. Output is `iv.authTag.ciphertext`,
 * base64url-encoded — self-contained, so no separate IV column is needed.
 */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString('base64url'),
    authTag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join('.');
}

export function decryptSecret(encoded: string): string {
  const parts = encoded.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed ciphertext');
  }

  const [ivPart, tagPart, dataPart] = parts;
  const iv = Buffer.from(ivPart, 'base64url');
  const authTag = Buffer.from(tagPart, 'base64url');
  const ciphertext = Buffer.from(dataPart, 'base64url');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Malformed ciphertext');
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Deterministically derives a high-entropy value from a stable input.
 *
 * Used to mint the hidden credentials that back a "Continue with TMDB" account
 * (see lib/auth/tmdb-bridge.ts). Deterministic derivation means we never have to
 * store those credentials anywhere.
 */
export function deriveSecret(namespace: string, input: string): string {
  const secret = process.env.TMDB_BRIDGE_SECRET;
  if (!secret) {
    throw new Error(
      'TMDB_BRIDGE_SECRET is not set. Generate one with: openssl rand -base64 32'
    );
  }
  return createHmac('sha256', secret)
    .update(`${namespace}:${input}`)
    .digest('base64url');
}
