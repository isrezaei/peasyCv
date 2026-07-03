import { createHash } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Refresh tokens (full JWTs) exceed bcrypt's 72-byte input limit, so we first
 * collapse them to a fixed-length SHA-256 hex digest (full-token entropy inside
 * bcrypt's window) and then bcrypt that. Use the matching verify below.
 */
export function hashToken(token: string): Promise<string> {
  return bcrypt.hash(sha256Hex(token), SALT_ROUNDS);
}

export function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(sha256Hex(token), hash);
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
