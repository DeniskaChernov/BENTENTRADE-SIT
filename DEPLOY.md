# Bententrade — деплой и эксплуатация

Стек: **Cloudflare Workers** (Hono API + CRM) + **Static Assets** (статический сайт из корня репозитория) + **D1** (БД) + **R2** (медиа) + **KV** (сессии).

Один воркер обслуживает и статику, и `/api/*`, и `/admin` — CORS не нужен, домен один.

## 1. Предварительно

```bash
npm install
npx wrangler login
```

## 2. Разовая инициализация ресурсов

```bash
npm run cf:provision:d1    # создаёт D1 базу bententrade_db
npm run cf:provision:kv    # создаёт KV namespace SESSIONS
npm run cf:provision:r2    # создаёт R2 bucket bententrade-media
```

Команды выведут `database_id` и KV `id`. Впишите их в `wrangler.jsonc` вместо
плейсхолдеров `REPLACE_WITH_D1_DATABASE_ID` и `REPLACE_WITH_KV_NAMESPACE_ID`.

## 3. Секреты (никогда не коммитятся)

Продакшен-секреты задаются через `wrangler secret put` (хранятся в Cloudflare, не в репозитории):

```bash
npx wrangler secret put ADMIN_BOOTSTRAP_TOKEN   # одноразовый токен для назначения первого админа
npx wrangler secret put TELEGRAM_BOT_TOKEN       # (опционально) уведомления о заявках/заказах
npx wrangler secret put TELEGRAM_CHAT_ID         # (опционально) чат/канал для уведомлений
```

Локально те же переменные лежат в `.dev.vars` (файл в `.gitignore`), пример — `.dev.vars.example`.

## 4. Миграции и наполнение БД

```bash
# локально (эмуляция)
npm run db:migrate:local
npm run seed:gen          # генерирует migrations/seed.sql из assets/products.js + i18n.js
npm run db:seed:local

# продакшен
npm run db:migrate
npm run db:seed
```

## 5. Деплой

```bash
npm run deploy            # или: npm run release (typecheck + migrate + deploy)
```

`release` прогоняет проверку типов, применяет миграции на remote и деплоит воркер вместе со статикой.

## 6. Первый администратор

1. Зарегистрируйтесь на сайте через `/login.html` (обычный аккаунт).
2. Повысьте его до админа одноразовым токеном:

```bash
curl -X POST https://<домен>/api/auth/bootstrap-admin \
  -H "content-type: application/json" \
  -d '{"email":"you@example.com","token":"<ADMIN_BOOTSTRAP_TOKEN>"}'
```

3. Зайдите в CRM: `https://<домен>/admin`.

После назначения первого админа рекомендуется удалить/сменить `ADMIN_BOOTSTRAP_TOKEN`.

## 7. Резервные копии D1

```bash
npm run db:backup          # remote → ./backups/bententrade_db-remote-<timestamp>.sql
npm run db:backup -- --local
```

Каталог `backups/` в `.gitignore` и `.assetsignore` (не публикуется).
Рекомендуется хранить копии вне репозитория (например, загрузка в R2/облако по расписанию).

## 8. Проверки качества

- Типы: `npm run typecheck`
- Lighthouse: запустите после деплоя по продакшен-URL
  (`npx lighthouse https://<домен> --view`) — статический фронтенд, кэш ассетов
  и security-заголовки уже настроены на стороне воркера.

## Безопасность (уже реализовано)

- Пароли — PBKDF2-SHA256 (Web Crypto), сессии — в KV, cookie `HttpOnly`.
- Middleware доступа: `requireAuth` (кабинет), `requireAdmin` (CRM).
- Rate-limit (KV, фиксированное окно): `/api/contact`, `/api/orders`, `/api/auth/*`.
- Серверная валидация входных данных; цены заказа пересчитываются из БД.
- Базовые security-заголовки на все ответы; `noindex` для `/api` и `/admin`.
