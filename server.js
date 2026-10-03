import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import handler from 'serve-handler';
import { Pool } from 'pg';
import { ensureCmsSchema, handleCmsApi } from './cms-api.js';
import { signAdminJwt, verifyAdminJwt } from './admin-auth.js';

const port = Number(process.env.PORT || 3000);
const apiPrefix = '/api';

/** Убирает хвостовой «/» в подпути API, чтобы GET /api/health/ не уходил в 401 после isAuthorized. */
function normalizeApiSubpath(pathname) {
  if (!pathname.startsWith(apiPrefix)) return pathname;
  let p = pathname.slice(apiPrefix.length);
  if (!p) p = '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

console.log(
  `[Bententrade] boot node=${process.version} NODE_ENV=${process.env.NODE_ENV || '(unset)'} PORT=${process.env.PORT ?? '(unset)'} cwd=${process.cwd()}`,
);

/** Шаг продакшен-чеклиста: в production без секретов сервер не поднимается (открытый API и т.д.). */
const PROD_SECRETS_REQUIRED =
  process.env.NODE_ENV === 'production' || process.env.REQUIRE_PROD_SECRETS === 'true';

const MIN_API_TOKEN_LEN = Number(process.env.MIN_API_TOKEN_LEN || 16);
const MIN_ADMIN_PASSWORD_LEN = Number(process.env.MIN_ADMIN_PASSWORD_LEN || 12);

/** Сравнение секретов без утечки по времени (хэши фиксированной длины). */
function constantTimeEqualString(expected, candidate) {
  const a = createHash('sha256').update(String(expected ?? ''), 'utf8').digest();
  const b = createHash('sha256').update(String(candidate ?? ''), 'utf8').digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

/** GET /load-data и /get-data: в production выключены, пока не задан ENABLE_LEGACY_DATA_ENDPOINTS=true. */
function legacyDataEndpointsEnabled() {
  if (PROD_SECRETS_REQUIRED) return process.env.ENABLE_LEGACY_DATA_ENDPOINTS === 'true';
  return process.env.ENABLE_LEGACY_DATA_ENDPOINTS !== 'false';
}

const MAX_ORDER_ITEMS = Math.min(100, Math.max(1, Number(process.env.MAX_ORDER_ITEMS || 40)));
const MAX_ORDER_FIELD_LEN = Math.min(8000, Math.max(200, Number(process.env.MAX_ORDER_FIELD_LEN || 2000)));
const MAX_ORDER_ITEM_NAME_LEN = Math.min(2000, Math.max(100, Number(process.env.MAX_ORDER_ITEM_NAME_LEN || 500)));

function validateOrderPayload(body) {
  const items = body?.items;
  if (!Array.isArray(items)) return { ok: false, error: 'Некорректный формат заказа' };
  if (items.length === 0) return { ok: false, error: 'Пустой заказ' };
  if (items.length > MAX_ORDER_ITEMS) return { ok: false, error: 'Слишком много позиций в заказе' };
  for (const item of items) {
    const q = Number(item?.quantity ?? 1);
    if (!Number.isFinite(q) || q < 1 || q > 99_999) return { ok: false, error: 'Некорректное количество' };
    if (String(item?.name || '').length > MAX_ORDER_ITEM_NAME_LEN) {
      return { ok: false, error: 'Слишком длинное название товара' };
    }
  }
  const c = body?.customerInfo;
  if (c && typeof c === 'object' && !Array.isArray(c)) {
    for (const key of ['name', 'phone', 'address', 'notes']) {
      const v = c[key];
      if (v != null && String(v).length > MAX_ORDER_FIELD_LEN) {
        return { ok: false, error: 'Слишком длинное поле в контактах' };
      }
    }
  }
  return { ok: true };
}

function assertProductionSecretsOrExit() {
  if (!PROD_SECRETS_REQUIRED) return;

  const problems = [];
  const dbUrl = String(process.env.DATABASE_URL || '').trim();
  if (!dbUrl) problems.push('DATABASE_URL пустой или не задан');

  const apiTok = String(process.env.API_TOKEN || '').trim();
  if (apiTok.length < MIN_API_TOKEN_LEN) {
    problems.push(
      `API_TOKEN слишком короткий (нужно ≥ ${MIN_API_TOKEN_LEN} символов), иначе API фактически без защиты`,
    );
  }

  const adminPass = String(process.env.ADMIN_PASSWORD || '').trim();
  if (adminPass.length < MIN_ADMIN_PASSWORD_LEN) {
    problems.push(`ADMIN_PASSWORD слишком короткий (нужно ≥ ${MIN_ADMIN_PASSWORD_LEN} символов)`);
  }

  const jwtSecret = String(process.env.ADMIN_JWT_SECRET || '').trim();
  if (jwtSecret.length < 32) {
    problems.push(
      'ADMIN_JWT_SECRET не задан или короче 32 символов (нужен для подписи админского JWT; сгенерируйте: openssl rand -hex 32)',
    );
  }

  if (problems.length === 0) return;

  console.error('');
  console.error('[Bententrade] Остановка: для production не выполнены требования безопасности окружения:');
  for (const p of problems) console.error(`  • ${p}`);
  console.error('');
  console.error(
    'Укажите переменные в Railway (Web-сервис) или в .env. Локально: не ставьте NODE_ENV=production для server.js',
  );
  console.error(
    'либо временно отключите проверку: REQUIRE_PROD_SECRETS=false (только для отладки, не в публичном проде).',
  );
  console.error('');
  process.exit(1);
}

assertProductionSecretsOrExit();
console.log('[Bententrade] production checks passed, creating server…');

const API_TOKEN = process.env.API_TOKEN || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 10000);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  // Без таймаута TCP может «висеть» минутами (часто при неверном хосте или .internal с ПК)
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 15000),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  max: Number(process.env.PG_POOL_MAX || 10),
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

const ADMIN_ROLE_ENV = process.env.ADMIN_ROLE || 'owner';

/** В production можно включить: для CMS принимается только JWT (заголовок X-Admin-Password для API не действует). Логин POST /admin/login без изменений. */
const ADMIN_SESSION_PASSWORD_DISABLED = process.env.ADMIN_SESSION_PASSWORD_DISABLED === 'true';

/** Роль только из JWT или из БД после проверки пароля; заголовок X-Admin-Role не используется. */
async function resolveAdminSession(req) {
  const token = String(req.headers['x-admin-token'] || '').trim();
  if (token) {
    const p = verifyAdminJwt(token);
    if (p) {
      return { role: p.role, actor: String(p.email || p.sub || 'admin') };
    }
    return null;
  }
  if (ADMIN_SESSION_PASSWORD_DISABLED) return null;
  const pwd = String(req.headers['x-admin-password'] || '');
  if (ADMIN_PASSWORD && constantTimeEqualString(ADMIN_PASSWORD, pwd)) {
    const email = process.env.ADMIN_EMAIL || 'admin@local';
    try {
      const r = await pool.query('SELECT role FROM admin_users WHERE email = $1 LIMIT 1', [email]);
      let dbRole = r.rows[0]?.role;
      if (dbRole !== 'owner' && dbRole !== 'editor' && dbRole !== 'manager') {
        dbRole = ADMIN_ROLE_ENV;
      }
      return { role: dbRole || ADMIN_ROLE_ENV, actor: email };
    } catch {
      return { role: ADMIN_ROLE_ENV, actor: email };
    }
  }
  return null;
}

let dbReady = false;
let dbInitError = null;

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      variants JSONB NOT NULL DEFAULT '[]'::jsonb,
      category TEXT NOT NULL DEFAULT '',
      size TEXT,
      style TEXT,
      dimensions JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      customer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'pending',
      language TEXT NOT NULL DEFAULT 'ru',
      telegram_message_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_login_failures (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_admin_login_failures_ip_created_at
    ON admin_login_failures (ip, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_submit_attempts (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_order_submit_attempts_ip_created_at
    ON order_submit_attempts (ip, created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS telegram_outbound_attempts (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_telegram_outbound_ip_created_at
    ON telegram_outbound_attempts (ip, created_at DESC);
  `);

  await ensureCmsSchema(pool);
}

function normalizeHtmlPathname(p) {
  if (p !== '/' && p.endsWith('/')) return p.slice(0, -1) || '/';
  return p;
}

const PRERENDER_HTML = {
  '/': 'index.html',
  '/catalog': 'catalog.html',
  '/legal': 'legal.html',
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.end(JSON.stringify(payload));
}

/** Идентификатор запроса для логов и поддержки (всегда новый UUID на стороне сервера). */
function assignApiRequestId(req, res) {
  res.setHeader('X-Request-Id', randomUUID());
}

/** За прокси (Railway и т.п.) берём первый hop из X-Forwarded-For. */
function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) {
    return xf.split(',')[0].trim().slice(0, 80);
  }
  const rip = req.socket?.remoteAddress;
  return typeof rip === 'string' ? rip : 'unknown';
}

const ADMIN_LOGIN_RATE_DISABLED = process.env.ADMIN_LOGIN_RATE_DISABLED === 'true';
const ADMIN_LOGIN_RATE_MAX = Math.max(1, Number(process.env.ADMIN_LOGIN_RATE_MAX || 15));
const ADMIN_LOGIN_RATE_WINDOW_MS = Math.max(
  60_000,
  Number(process.env.ADMIN_LOGIN_RATE_WINDOW_MS || 15 * 60 * 1000),
);

/** In-memory fallback, если БД ещё не готова или запрос к PostgreSQL не удался. */
const adminLoginFailTimestamps = new Map();

function adminLoginFailCountMemory(ip) {
  const now = Date.now();
  let arr = adminLoginFailTimestamps.get(ip) || [];
  arr = arr.filter((t) => now - t < ADMIN_LOGIN_RATE_WINDOW_MS);
  if (arr.length === 0) adminLoginFailTimestamps.delete(ip);
  else adminLoginFailTimestamps.set(ip, arr);
  return arr.length;
}

function adminLoginRecordFailMemory(ip) {
  const now = Date.now();
  const arr = (adminLoginFailTimestamps.get(ip) || []).filter((t) => now - t < ADMIN_LOGIN_RATE_WINDOW_MS);
  arr.push(now);
  adminLoginFailTimestamps.set(ip, arr);
}

function adminLoginClearFailsMemory(ip) {
  adminLoginFailTimestamps.delete(ip);
}

/** Скользящее окно в PostgreSQL (переживает рестарт процесса; несколько инстансов видят общий счётчик). */
async function adminLoginFailCountStored(ip) {
  if (ADMIN_LOGIN_RATE_DISABLED) return 0;
  if (!dbReady) return adminLoginFailCountMemory(ip);
  try {
    const since = new Date(Date.now() - ADMIN_LOGIN_RATE_WINDOW_MS).toISOString();
    const pruneBefore = new Date(Date.now() - ADMIN_LOGIN_RATE_WINDOW_MS * 4).toISOString();
    await pool.query(`DELETE FROM admin_login_failures WHERE created_at < $1::timestamptz`, [pruneBefore]);
    const r = await pool.query(
      `SELECT COUNT(*)::int AS c FROM admin_login_failures WHERE ip = $1 AND created_at > $2::timestamptz`,
      [ip, since],
    );
    return r.rows[0]?.c ?? 0;
  } catch {
    return adminLoginFailCountMemory(ip);
  }
}

async function adminLoginRecordFailStored(ip) {
  if (ADMIN_LOGIN_RATE_DISABLED) return;
  if (!dbReady) {
    adminLoginRecordFailMemory(ip);
    return;
  }
  try {
    await pool.query(`INSERT INTO admin_login_failures (id, ip) VALUES ($1, $2)`, [randomUUID(), ip]);
  } catch {
    adminLoginRecordFailMemory(ip);
  }
}

async function adminLoginClearFailsStored(ip) {
  if (ADMIN_LOGIN_RATE_DISABLED) return;
  if (!dbReady) {
    adminLoginClearFailsMemory(ip);
    return;
  }
  try {
    await pool.query(`DELETE FROM admin_login_failures WHERE ip = $1`, [ip]);
  } catch {
    adminLoginClearFailsMemory(ip);
  }
}

const ORDER_SUBMIT_RATE_DISABLED = process.env.ORDER_SUBMIT_RATE_DISABLED === 'true';
const ORDER_SUBMIT_RATE_MAX = Math.max(1, Number(process.env.ORDER_SUBMIT_RATE_MAX || 25));
const ORDER_SUBMIT_RATE_WINDOW_MS = Math.max(
  60_000,
  Number(process.env.ORDER_SUBMIT_RATE_WINDOW_MS || 15 * 60 * 1000),
);

const orderSubmitAttemptTimestamps = new Map();

function orderSubmitRateCountMemory(ip) {
  const now = Date.now();
  let arr = orderSubmitAttemptTimestamps.get(ip) || [];
  arr = arr.filter((t) => now - t < ORDER_SUBMIT_RATE_WINDOW_MS);
  if (arr.length === 0) orderSubmitAttemptTimestamps.delete(ip);
  else orderSubmitAttemptTimestamps.set(ip, arr);
  return arr.length;
}

function orderSubmitRecordAttemptMemory(ip) {
  const now = Date.now();
  const arr = (orderSubmitAttemptTimestamps.get(ip) || []).filter((t) => now - t < ORDER_SUBMIT_RATE_WINDOW_MS);
  arr.push(now);
  orderSubmitAttemptTimestamps.set(ip, arr);
}

async function orderSubmitRateCountStored(ip) {
  if (ORDER_SUBMIT_RATE_DISABLED) return 0;
  if (!dbReady) return orderSubmitRateCountMemory(ip);
  try {
    const since = new Date(Date.now() - ORDER_SUBMIT_RATE_WINDOW_MS).toISOString();
    const pruneBefore = new Date(Date.now() - ORDER_SUBMIT_RATE_WINDOW_MS * 4).toISOString();
    await pool.query(`DELETE FROM order_submit_attempts WHERE created_at < $1::timestamptz`, [pruneBefore]);
    const r = await pool.query(
      `SELECT COUNT(*)::int AS c FROM order_submit_attempts WHERE ip = $1 AND created_at > $2::timestamptz`,
      [ip, since],
    );
    return r.rows[0]?.c ?? 0;
  } catch {
    return orderSubmitRateCountMemory(ip);
  }
}

async function orderSubmitRecordAttemptStored(ip) {
  if (ORDER_SUBMIT_RATE_DISABLED) return;
  if (!dbReady) {
    orderSubmitRecordAttemptMemory(ip);
    return;
  }
  try {
    await pool.query(`INSERT INTO order_submit_attempts (id, ip) VALUES ($1, $2)`, [randomUUID(), ip]);
  } catch {
    orderSubmitRecordAttemptMemory(ip);
  }
}

const TELEGRAM_OUTBOUND_RATE_DISABLED = process.env.TELEGRAM_OUTBOUND_RATE_DISABLED === 'true';
const TELEGRAM_OUTBOUND_RATE_MAX = Math.max(1, Number(process.env.TELEGRAM_OUTBOUND_RATE_MAX || 35));
const TELEGRAM_OUTBOUND_RATE_WINDOW_MS = Math.max(
  60_000,
  Number(process.env.TELEGRAM_OUTBOUND_RATE_WINDOW_MS || 15 * 60 * 1000),
);

const telegramOutboundTimestamps = new Map();

function telegramOutboundRateCountMemory(ip) {
  const now = Date.now();
  let arr = telegramOutboundTimestamps.get(ip) || [];
  arr = arr.filter((t) => now - t < TELEGRAM_OUTBOUND_RATE_WINDOW_MS);
  if (arr.length === 0) telegramOutboundTimestamps.delete(ip);
  else telegramOutboundTimestamps.set(ip, arr);
  return arr.length;
}

function telegramOutboundRecordMemory(ip) {
  const now = Date.now();
  const arr = (telegramOutboundTimestamps.get(ip) || []).filter((t) => now - t < TELEGRAM_OUTBOUND_RATE_WINDOW_MS);
  arr.push(now);
  telegramOutboundTimestamps.set(ip, arr);
}

async function telegramOutboundRateCountStored(ip) {
  if (TELEGRAM_OUTBOUND_RATE_DISABLED) return 0;
  if (!dbReady) return telegramOutboundRateCountMemory(ip);
  try {
    const since = new Date(Date.now() - TELEGRAM_OUTBOUND_RATE_WINDOW_MS).toISOString();
    const pruneBefore = new Date(Date.now() - TELEGRAM_OUTBOUND_RATE_WINDOW_MS * 4).toISOString();
    await pool.query(`DELETE FROM telegram_outbound_attempts WHERE created_at < $1::timestamptz`, [pruneBefore]);
    const r = await pool.query(
      `SELECT COUNT(*)::int AS c FROM telegram_outbound_attempts WHERE ip = $1 AND created_at > $2::timestamptz`,
      [ip, since],
    );
    return r.rows[0]?.c ?? 0;
  } catch {
    return telegramOutboundRateCountMemory(ip);
  }
}

async function telegramOutboundRecordStored(ip) {
  if (TELEGRAM_OUTBOUND_RATE_DISABLED) return;
  if (!dbReady) {
    telegramOutboundRecordMemory(ip);
    return;
  }
  try {
    await pool.query(`INSERT INTO telegram_outbound_attempts (id, ip) VALUES ($1, $2)`, [randomUUID(), ip]);
  } catch {
    telegramOutboundRecordMemory(ip);
  }
}

/** Список разрешённых Origin для CORS. Пустой → `*`. Иначе: явный `CORS_ALLOWED_ORIGINS` (через запятую) или один `SITE_ORIGIN`. */
function buildCorsAllowedList() {
  const explicit = process.env.CORS_ALLOWED_ORIGINS;
  if (explicit !== undefined) {
    return explicit.split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  }
  const site = String(process.env.SITE_ORIGIN || '').trim().replace(/\/$/, '');
  return site ? [site] : [];
}

const CORS_ALLOWED_LIST = buildCorsAllowedList();

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (CORS_ALLOWED_LIST.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && CORS_ALLOWED_LIST.includes(String(origin).trim().replace(/\/$/, ''))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Admin-Password, X-Admin-Token, X-Admin-User, X-Request-Id',
  );
  res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
}

function getBearerToken(req) {
  const raw = req.headers.authorization || '';
  if (!raw.startsWith('Bearer ')) return '';
  return raw.slice(7).trim();
}

function isAuthorized(req) {
  if (!API_TOKEN) return true;
  return constantTimeEqualString(API_TOKEN, getBearerToken(req));
}

/** Liveness/readiness для Railway и мониторинга (без Bearer; до isAuthorized). */
function sendHealthResponse(req, res) {
  setCorsHeaders(req, res);
  assignApiRequestId(req, res);
  const healthUrl = new URL(req.url || '/api/health', 'http://127.0.0.1');
  const wantDetails =
    healthUrl.searchParams.get('detailed') === '1' ||
    healthUrl.searchParams.get('detailed') === 'true';
  const canSeeDetails = wantDetails && API_TOKEN && getBearerToken(req) === API_TOKEN;

  const dbState = dbReady ? 'ready' : dbInitError ? 'error' : 'initializing';
  const payload = {
    success: true,
    status: 'ok',
    db: dbState,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
  if (canSeeDetails && dbInitError) {
    payload.dbError = String(dbInitError.message || dbInitError);
  }
  sendJson(res, 200, payload);
}

const DEFAULT_JSON_BODY_MAX = 2 * 1024 * 1024;
const ORDER_BODY_MAX_BYTES = Math.min(
  DEFAULT_JSON_BODY_MAX,
  Math.max(16 * 1024, Number(process.env.ORDER_BODY_MAX_BYTES || 256 * 1024)),
);

function readBody(req, maxBytes = DEFAULT_JSON_BODY_MAX) {
  const limit = Math.min(maxBytes, DEFAULT_JSON_BODY_MAX);
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > limit) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    features: row.features || [],
    variants: row.variants || [],
    category: row.category,
    size: row.size || undefined,
    style: row.style || undefined,
    dimensions: row.dimensions || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrderRow(row) {
  return {
    id: row.id,
    items: row.items || [],
    customerInfo: row.customer_info || {},
    status: row.status,
    language: row.language,
    telegramMessageId: row.telegram_message_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function sendTelegram(text, chatId = TELEGRAM_CHAT_ID) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) {
    return { success: false, error: 'Telegram is not configured' };
  }

  const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  const tgData = await tgResponse.json();
  if (!tgResponse.ok || !tgData.ok) {
    return { success: false, error: tgData.description || 'Telegram API error' };
  }

  return { success: true, messageId: tgData.result?.message_id ? String(tgData.result.message_id) : null };
}

function formatOrderMessage(orderData) {
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const customer = orderData.customerInfo || {};
  const lines = [
    '🛒 <b>Новый заказ Bententrade</b>',
    '',
    '<b>Товары:</b>',
  ];

  items.forEach((item, idx) => {
    const parts = [`${idx + 1}. ${item.name || 'Товар'}`, `x${item.quantity || 1}`];
    if (item.variant) parts.push(`цвет: ${item.variant}`);
    if (item.size) parts.push(`размер: ${item.size}`);
    if (item.style) parts.push(`стиль: ${item.style}`);
    if (item.lineMeta) parts.push(String(item.lineMeta));
    lines.push(`• ${parts.join(' | ')}`);
  });

  lines.push('');
  lines.push('<b>Клиент:</b>');
  lines.push(`Имя: ${customer.name || '-'}`);
  lines.push(`Телефон: ${customer.phone || '-'}`);
  if (customer.address) lines.push(`Адрес: ${customer.address}`);
  if (customer.notes) lines.push(`Комментарий: ${customer.notes}`);
  if (orderData.total) lines.push(`Сумма: ${orderData.total}`);
  lines.push(`Язык: ${orderData.language || 'ru'}`);
  lines.push(`Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`);

  return lines.join('\n');
}

async function handleApi(req, res, pathname) {
  setCorsHeaders(req, res);
  assignApiRequestId(req, res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const method = req.method || 'GET';
  const path = normalizeApiSubpath(pathname);

  if (method === 'GET' && path === '/health') {
    sendHealthResponse(req, res);
    return true;
  }

  /** Публичный чат-ассистент (заглушка; подключите OPENAI_API_KEY для ИИ) */
  if (method === 'POST' && path === '/public/assistant/chat') {
    try {
      const body = await readBody(req, 12_000);
      const question = String(body?.question || '').slice(0, 4000);
      const lang = String(body?.language || 'ru');
      if (!question.trim()) {
        sendJson(res, 400, { success: false, error: 'Empty question' });
        return true;
      }
      const openaiKey = String(process.env.OPENAI_API_KEY || '').trim();
      if (openaiKey) {
        const sys =
          'You are Bententrade shop assistant for artificial rattan and planters. Answer briefly in the user language. If unsure, suggest contacting the manager.';
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: sys },
              {
                role: 'user',
                content: JSON.stringify({ question, context: body?.context || {} }),
              },
            ],
            max_tokens: 600,
          }),
        });
        const data = await r.json().catch(() => ({}));
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) {
          sendJson(res, 200, { success: true, reply: String(reply), source: 'openai' });
          return true;
        }
      }
      const stub =
        lang === 'uz'
          ? 'Hozircha avtomatik javob. OPENAI_API_KEY qo‘shing yoki savolingizni menejerga yuboring.'
          : lang === 'en'
            ? 'Auto-reply placeholder. Add OPENAI_API_KEY or contact the manager.'
            : 'Пока шаблонный ответ. Добавьте OPENAI_API_KEY в окружение или напишите менеджеру.';
      sendJson(res, 200, { success: true, reply: stub, source: 'stub' });
      return true;
    } catch (e) {
      sendJson(res, 500, { success: false, error: 'assistant_failed' });
      return true;
    }
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { success: false, error: 'Unauthorized' });
    return true;
  }

  try {
    if (method === 'POST' && path === '/admin/login') {
      const clientIp = getClientIp(req);
      if (!ADMIN_LOGIN_RATE_DISABLED) {
        const failN = await adminLoginFailCountStored(clientIp);
        if (failN >= ADMIN_LOGIN_RATE_MAX) {
          res.setHeader('Retry-After', String(Math.ceil(ADMIN_LOGIN_RATE_WINDOW_MS / 1000)));
          sendJson(res, 429, { success: false, error: 'Слишком много попыток входа. Повторите позже.' });
          return true;
        }
      }
      const body = await readBody(req);
      const pwd = String(req.headers['x-admin-password'] || body.password || '');
      if (!ADMIN_PASSWORD || !constantTimeEqualString(ADMIN_PASSWORD, pwd)) {
        if (!ADMIN_LOGIN_RATE_DISABLED) await adminLoginRecordFailStored(clientIp);
        sendJson(res, 401, { success: false, error: 'Неверный пароль' });
        return true;
      }
      if (!ADMIN_LOGIN_RATE_DISABLED) await adminLoginClearFailsStored(clientIp);
      const email = process.env.ADMIN_EMAIL || 'admin@local';
      let sub = 'admin-default';
      let dbRole = ADMIN_ROLE_ENV;
      try {
        const r = await pool.query('SELECT id, role FROM admin_users WHERE email = $1 LIMIT 1', [email]);
        if (r.rows[0]?.id) sub = r.rows[0].id;
        if (
          r.rows[0]?.role === 'owner' ||
          r.rows[0]?.role === 'editor' ||
          r.rows[0]?.role === 'manager'
        ) {
          dbRole = r.rows[0].role;
        }
      } catch {
        /* БД ещё не готова — выдаём токен с ролью из окружения */
      }
      const token = signAdminJwt({ sub, email, role: dbRole });
      sendJson(res, 200, {
        success: true,
        token,
        expiresIn: 8 * 3600,
        role: dbRole,
      });
      return true;
    }

    const cmsHandled = await handleCmsApi({
      req,
      res,
      method,
      path,
      pool,
      readBody,
      sendJson,
      resolveAdminSession,
    });
    if (cmsHandled) return true;

    if (method === 'GET' && path === '/products') {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, { success: true, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path.startsWith('/products/filter/')) {
      const category = decodeURIComponent(path.replace('/products/filter/', ''));
      const result = await pool.query('SELECT * FROM products WHERE category = $1 ORDER BY created_at ASC', [category]);
      sendJson(res, 200, { success: true, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      const result = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
      if (!result.rows.length) {
        sendJson(res, 404, { success: false, error: 'Product not found' });
        return true;
      }
      sendJson(res, 200, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'POST' && path === '/products') {
      const body = await readBody(req);
      const id = body.id || randomUUID();
      const now = new Date().toISOString();
      const result = await pool.query(
        `INSERT INTO products (id, name, description, image, features, variants, category, size, style, dimensions, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)
         RETURNING *`,
        [
          id,
          body.name || '',
          body.description || '',
          body.image || '',
          JSON.stringify(body.features || []),
          JSON.stringify(body.variants || []),
          body.category || '',
          body.size || null,
          body.style || null,
          body.dimensions ? JSON.stringify(body.dimensions) : null,
          now,
        ],
      );
      sendJson(res, 201, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'PUT' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      const body = await readBody(req);
      const existing = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
      if (!existing.rows.length) {
        sendJson(res, 404, { success: false, error: 'Product not found' });
        return true;
      }
      const current = existing.rows[0];
      const result = await pool.query(
        `UPDATE products
         SET name=$2, description=$3, image=$4, features=$5, variants=$6, category=$7, size=$8, style=$9, dimensions=$10, updated_at=NOW()
         WHERE id=$1
         RETURNING *`,
        [
          id,
          body.name ?? current.name,
          body.description ?? current.description,
          body.image ?? current.image,
          JSON.stringify(body.features ?? current.features ?? []),
          JSON.stringify(body.variants ?? current.variants ?? []),
          body.category ?? current.category,
          body.size ?? current.size,
          body.style ?? current.style,
          body.dimensions ? JSON.stringify(body.dimensions) : current.dimensions,
        ],
      );
      sendJson(res, 200, { success: true, product: mapProductRow(result.rows[0]) });
      return true;
    }

    if (method === 'DELETE' && path.startsWith('/products/')) {
      const id = decodeURIComponent(path.replace('/products/', ''));
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      sendJson(res, 200, { success: true });
      return true;
    }

    if (method === 'POST' && path === '/products/bulk') {
      const body = await readBody(req);
      const products = Array.isArray(body.products) ? body.products : [];
      await pool.query('BEGIN');
      try {
        await pool.query('DELETE FROM products');
        for (const p of products) {
          await pool.query(
            `INSERT INTO products (id, name, description, image, features, variants, category, size, style, dimensions)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              p.id || randomUUID(),
              p.name || '',
              p.description || '',
              p.image || '',
              JSON.stringify(p.features || []),
              JSON.stringify(p.variants || []),
              p.category || '',
              p.size || null,
              p.style || null,
              p.dimensions ? JSON.stringify(p.dimensions) : null,
            ],
          );
        }
        await pool.query('COMMIT');
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, { success: true, total: result.rows.length, products: result.rows.map(mapProductRow) });
      return true;
    }

    if (method === 'GET' && path === '/orders') {
      const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      sendJson(res, 200, { success: true, orders: result.rows.map(mapOrderRow), storageMode: 'database' });
      return true;
    }

    if (method === 'POST' && path === '/orders') {
      const orderClientIp = getClientIp(req);
      if (!ORDER_SUBMIT_RATE_DISABLED) {
        const submitN = await orderSubmitRateCountStored(orderClientIp);
        if (submitN >= ORDER_SUBMIT_RATE_MAX) {
          res.setHeader('Retry-After', String(Math.ceil(ORDER_SUBMIT_RATE_WINDOW_MS / 1000)));
          sendJson(res, 429, {
            success: false,
            error: 'Слишком много заявок с вашего адреса. Повторите позже.',
          });
          return true;
        }
      }
      let body;
      try {
        body = await readBody(req, ORDER_BODY_MAX_BYTES);
      } catch (readErr) {
        if (String(readErr?.message || '') === 'Payload too large') {
          sendJson(res, 413, { success: false, error: 'Слишком большой запрос' });
          return true;
        }
        if (String(readErr?.message || '') === 'Invalid JSON') {
          sendJson(res, 400, { success: false, error: 'Некорректный JSON' });
          return true;
        }
        throw readErr;
      }
      const orderCheck = validateOrderPayload(body);
      if (!orderCheck.ok) {
        sendJson(res, 400, { success: false, error: orderCheck.error });
        return true;
      }
      const id = `ORD-${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO orders (id, items, customer_info, status, language, telegram_message_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [
          id,
          JSON.stringify(body.items || []),
          JSON.stringify(body.customerInfo || {}),
          body.status || 'pending',
          body.language || 'ru',
          body.telegramMessageId || null,
        ],
      );
      if (!ORDER_SUBMIT_RATE_DISABLED) await orderSubmitRecordAttemptStored(orderClientIp);
      sendJson(res, 201, { success: true, orderId: id, order: mapOrderRow(result.rows[0]) });
      return true;
    }

    if (method === 'PUT' && path.startsWith('/orders/') && path.endsWith('/status')) {
      const id = decodeURIComponent(path.replace('/orders/', '').replace('/status', ''));
      const body = await readBody(req);
      const result = await pool.query(
        'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id, body.status || 'pending'],
      );
      if (!result.rows.length) {
        sendJson(res, 404, { success: false, error: 'Order not found' });
        return true;
      }
      sendJson(res, 200, { success: true, order: mapOrderRow(result.rows[0]) });
      return true;
    }

    if (method === 'DELETE' && path.startsWith('/orders/')) {
      const id = decodeURIComponent(path.replace('/orders/', ''));
      await pool.query('DELETE FROM orders WHERE id = $1', [id]);
      sendJson(res, 200, { success: true });
      return true;
    }

    if (method === 'GET' && path === '/stats') {
      const result = await pool.query('SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status');
      const stats = {
        totalOrders: 0,
        activeOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        archivedOrders: 0,
      };
      for (const row of result.rows) {
        const count = Number(row.count);
        stats.totalOrders += count;
        if (row.status === 'pending') stats.pendingOrders = count;
        if (row.status === 'processing') stats.processingOrders = count;
        if (row.status === 'completed') stats.completedOrders = count;
      }
      stats.activeOrders = stats.pendingOrders + stats.processingOrders;
      stats.archivedOrders = stats.completedOrders;
      sendJson(res, 200, { success: true, stats, storageMode: 'database' });
      return true;
    }

    if (method === 'POST' && path === '/telegram/send') {
      const tgIp = getClientIp(req);
      if (!TELEGRAM_OUTBOUND_RATE_DISABLED) {
        const tgN = await telegramOutboundRateCountStored(tgIp);
        if (tgN >= TELEGRAM_OUTBOUND_RATE_MAX) {
          res.setHeader('Retry-After', String(Math.ceil(TELEGRAM_OUTBOUND_RATE_WINDOW_MS / 1000)));
          sendJson(res, 429, {
            success: false,
            error: 'Слишком много сообщений в Telegram с вашего адреса. Повторите позже.',
          });
          return true;
        }
      }
      const body = await readBody(req);
      const message = formatOrderMessage(body);
      const sent = await sendTelegram(message);
      if (!sent.success) {
        sendJson(res, 400, { success: false, error: sent.error });
        return true;
      }
      if (!TELEGRAM_OUTBOUND_RATE_DISABLED) await telegramOutboundRecordStored(tgIp);
      sendJson(res, 200, { success: true, messageId: sent.messageId });
      return true;
    }

    if (method === 'GET' && path === '/telegram/chats') {
      if (!TELEGRAM_BOT_TOKEN) {
        sendJson(res, 200, { success: false, error: 'TELEGRAM_BOT_TOKEN is not configured', chats: [] });
        return true;
      }
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        sendJson(res, 400, { success: false, error: data.description || 'Unable to fetch chats', chats: [] });
        return true;
      }

      const chats = new Map();
      for (const update of data.result || []) {
        const chat = update?.message?.chat || update?.channel_post?.chat;
        if (!chat?.id) continue;
        chats.set(String(chat.id), {
          id: String(chat.id),
          title: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || `Chat ${chat.id}`,
          type: chat.type || 'unknown',
        });
      }
      sendJson(res, 200, { success: true, chats: Array.from(chats.values()) });
      return true;
    }

    if (method === 'POST' && path === '/telegram/test') {
      const testIp = getClientIp(req);
      if (!TELEGRAM_OUTBOUND_RATE_DISABLED) {
        const tgN = await telegramOutboundRateCountStored(testIp);
        if (tgN >= TELEGRAM_OUTBOUND_RATE_MAX) {
          res.setHeader('Retry-After', String(Math.ceil(TELEGRAM_OUTBOUND_RATE_WINDOW_MS / 1000)));
          sendJson(res, 429, {
            success: false,
            error: 'Слишком много обращений к Telegram с вашего адреса. Повторите позже.',
          });
          return true;
        }
      }
      const body = await readBody(req);
      const result = await sendTelegram(
        `🧪 Тест Telegram от Bententrade\nВремя: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })}`,
        body.chatId || TELEGRAM_CHAT_ID,
      );
      if (result.success && !TELEGRAM_OUTBOUND_RATE_DISABLED) await telegramOutboundRecordStored(testIp);
      sendJson(res, result.success ? 200 : 400, result);
      return true;
    }

    if (method === 'GET' && path === '/load-data') {
      if (!legacyDataEndpointsEnabled()) {
        sendJson(res, 404, { success: false, error: 'Not found' });
        return true;
      }
      const existing = await pool.query('SELECT COUNT(*)::int AS count FROM products');
      if (Number(existing.rows[0]?.count || 0) > 0) {
        sendJson(res, 200, {
          success: true,
          data: {
            totalProducts: Number(existing.rows[0].count),
          },
          message: 'Данные уже загружены',
        });
        return true;
      }

      const seedProducts = [
        {
          id: '2',
          name: 'Кашпо 5л с ручкой',
          description: 'Плетеное кашпо 5 литров с ручкой',
          image: '/assets/aaa3f6c434f81fb8787b230c4e80ff40a3ff1805.webp',
          category: 'kashpo',
          size: '5л',
        },
        {
          id: '3',
          name: 'Кашпо 10л Классика',
          description: 'Плетеное кашпо 10 литров',
          image: '/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp',
          category: 'kashpo',
          size: '10л',
          style: 'Классика',
        },
        {
          id: '4',
          name: 'Кашпо 16л Классика',
          description: 'Большое плетеное кашпо 16 литров',
          image: '/assets/0b7c7dcc56f444de68a9e6496bc108a610b7c82f.webp',
          category: 'kashpo',
          size: '16л',
          style: 'Классика',
        },
      ];

      for (const p of seedProducts) {
        await pool.query(
          `INSERT INTO products (id, name, description, image, category, size, style)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.description, p.image, p.category, p.size || null, p.style || null],
        );
      }

      sendJson(res, 200, {
        success: true,
        data: { kashpoCount: 3, rattanCount: 0, totalProducts: 3 },
      });
      return true;
    }

    if (method === 'GET' && path === '/get-data') {
      if (!legacyDataEndpointsEnabled()) {
        sendJson(res, 404, { success: false, error: 'Not found' });
        return true;
      }
      const result = await pool.query('SELECT * FROM products ORDER BY created_at ASC');
      sendJson(res, 200, {
        success: true,
        data: {
          totalProducts: result.rows.length,
          products: result.rows.map(mapProductRow),
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    const rid = res.getHeader('X-Request-Id');
    console.error('API error:', rid ? `[${rid}]` : '', error?.message || error);
    sendJson(res, 500, { success: false, error: 'Internal server error' });
    return true;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const method = request.method || 'GET';

    // Короткий путь для Railway healthcheck (не только /api/health).
    if (method === 'GET' && normalizeHtmlPathname(requestUrl.pathname) === '/health') {
      sendHealthResponse(request, response);
      return;
    }

    if (requestUrl.pathname.startsWith(apiPrefix)) {
      const handled = await handleApi(request, response, requestUrl.pathname);
      if (handled) return;
      setCorsHeaders(request, response);
      sendJson(response, 404, { success: false, error: 'Not found' });
      return;
    }

    const htmlPath = normalizeHtmlPathname(requestUrl.pathname);
    if (method === 'GET' && PRERENDER_HTML[htmlPath]) {
      const filePath = path.join(process.cwd(), 'build', PRERENDER_HTML[htmlPath]);
      try {
        const buf = await fs.readFile(filePath);
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-Frame-Options', 'SAMEORIGIN');
        response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.end(buf);
        return;
      } catch (err) {
        console.error('Prerender HTML read failed:', err.message);
      }
    }

    return handler(request, response, {
      public: 'build',
      cleanUrls: true,
      rewrites: [{ source: '**', destination: '/index.html' }],
      headers: [
        {
          source: '**',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
        {
          source: '**/*.@(js|css|woff2|webp|avif)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        },
        {
          source: '**/*.@(svg|png|jpg|jpeg|gif)',
          headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
        },
        {
          source: 'index.html',
          headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        },
      ],
    });
  } catch (err) {
    console.error('HTTP handler error:', err?.message || err);
    try {
      if (!response.headersSent) {
        sendJson(response, 500, { success: false, error: 'Internal server error' });
      }
    } catch {
      /* ignore */
    }
  }
});

async function initializeDatabaseWithRetry() {
  try {
    await initializeDatabase();
    dbReady = true;
    dbInitError = null;
    console.log('PostgreSQL initialized');
  } catch (error) {
    dbReady = false;
    dbInitError = error;
    console.error(`Failed to initialize PostgreSQL: ${error.message}`);
    console.log(`Retrying PostgreSQL initialization in ${DB_RETRY_DELAY_MS}ms...`);
    setTimeout(() => {
      initializeDatabaseWithRetry().catch((retryError) => {
        console.error('Unexpected retry initializer error:', retryError.message);
      });
    }, DB_RETRY_DELAY_MS);
  }
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});

initializeDatabaseWithRetry().catch((error) => {
  dbInitError = error;
  console.error('Unexpected PostgreSQL bootstrap error:', error.message);
});
