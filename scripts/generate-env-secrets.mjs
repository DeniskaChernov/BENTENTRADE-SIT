#!/usr/bin/env node
/**
 * Генерирует случайные API_TOKEN, ADMIN_PASSWORD и ADMIN_JWT_SECRET для вставки в Railway или в .env
 * Запуск: npm run env:secrets
 */
import { randomBytes } from 'node:crypto';

const apiToken = randomBytes(32).toString('hex');
const adminPassword = randomBytes(12).toString('base64url').slice(0, 20);
const adminJwtSecret = randomBytes(32).toString('hex');

const block = `# Скопируйте в Railway → ваш Web-сервис → Variables (или в локальный .env)
# DATABASE_URL подключите через Reference к сервису PostgreSQL — не вставляйте сюда вручную с продакшена в чат.

API_TOKEN=${apiToken}
ADMIN_PASSWORD=${adminPassword}
ADMIN_JWT_SECRET=${adminJwtSecret}
VITE_API_TOKEN=${apiToken}
VITE_API_BASE_URL=/api

# Ниже — по желанию:
# TELEGRAM_BOT_TOKEN=
# TELEGRAM_CHAT_ID=
# SITE_ORIGIN=https://ваш-домен.uz
`;

console.log(block);
console.log(
  '---\nСохраните ADMIN_PASSWORD и ADMIN_JWT_SECRET в надёжном месте; они показываются один раз в консоли.\n',
);
