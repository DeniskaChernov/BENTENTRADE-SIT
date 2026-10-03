import { createHmac, timingSafeEqual } from 'node:crypto';

function base64urlJson(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64url');
}

function base64urlDecode(str) {
  return Buffer.from(str, 'base64url');
}

/**
 * Секрет только из ADMIN_JWT_SECRET в production (см. assert в server.js).
 * Dev: допускается производная от API_TOKEN, если секрет не задан.
 */
export function getAdminJwtSecret() {
  const s = String(process.env.ADMIN_JWT_SECRET || '').trim();
  if (s.length >= 32) return s;
  const api = String(process.env.API_TOKEN || '').trim();
  if (api.length >= 16) return `${api}.benten.admin.jwt.v1`;
  return 'dev-only-insecure-admin-jwt-secret';
}

/**
 * @param {{ sub: string; email: string; role: string }} payload
 * @param {number} [ttlSec] default 8h
 */
export function signAdminJwt(payload, ttlSec = 8 * 3600) {
  const secret = getAdminJwtSecret();
  const header = base64urlJson({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const body = {
    typ: 'admin',
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    iat: now,
    exp: now + ttlSec,
  };
  const payloadPart = base64urlJson(body);
  const sig = createHmac('sha256', secret).update(`${header}.${payloadPart}`).digest();
  const sigPart = base64url(sig);
  return `${header}.${payloadPart}.${sigPart}`;
}

/** @returns {null | { sub: string; email: string; role: string; exp: number; iat: number }} */
export function verifyAdminJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const secret = getAdminJwtSecret();
  const expected = createHmac('sha256', secret).update(`${h}.${p}`).digest();
  let sigBuf;
  try {
    sigBuf = base64urlDecode(s);
  } catch {
    return null;
  }
  if (sigBuf.length !== expected.length || !timingSafeEqual(sigBuf, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(base64urlDecode(p).toString('utf8'));
  } catch {
    return null;
  }
  if (payload.typ !== 'admin') return null;
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && now > payload.exp) return null;
  const role = String(payload.role || '').toLowerCase();
  if (role !== 'owner' && role !== 'editor' && role !== 'manager') return null;
  return payload;
}
