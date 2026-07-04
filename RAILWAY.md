# Деплой Bententrade на Railway

Бэкенд переписан с Cloudflare Workers на **Node + Hono + PostgreSQL** и рассчитан
на единый сервис Railway, который:

- отдаёт статический сайт (HTML/CSS/JS из корня репозитория);
- обслуживает API (`/api/*`), медиа (`/media/*`) и встроенную CRM (`/admin`);
- при старте сам применяет схему БД и, если товаров ещё нет, наполняет её из
  `assets/products.js` + `assets/i18n.js`.

Те же роуты Hono (`worker/routes/*.ts`), что были на Cloudflare, работают без
изменений — привязки CF заменены адаптерами:

| Cloudflare | Railway |
|---|---|
| D1 (SQLite) | PostgreSQL (`pg`) |
| KV (сессии, rate-limit) | таблица `kv_store` в PostgreSQL |
| R2 (медиа) | файлы на Volume (`MEDIA_DIR`) |

---

## Если БД и сервис на Railway уже есть

1. **Свяжите репозиторий с сервисом.** В настройках сервиса → *Settings → Source*
   подключите этот GitHub-репозиторий (ветка `main`). Railpack сам определит
   Node-проект и запустит `npm install` → `npm start`.

2. **Проброс `DATABASE_URL` из вашей БД в сервис.** В сервисе → *Variables*
   добавьте переменную-ссылку на плагин Postgres:

   ```
   DATABASE_URL = ${{ Postgres.DATABASE_URL }}
   ```

   (в UI: *New Variable → Add Reference → выбрать вашу базу → DATABASE_URL*).
   Порт слушать не нужно задавать вручную — Railway передаёт `PORT` сам, сервер
   его читает.

3. **Задайте остальные переменные** (сервис → *Variables*):

   | Переменная | Назначение |
   |---|---|
   | `SITE_ORIGIN` | публичный адрес, напр. `https://bententrade.uz` |
   | `MEDIA_DIR` | путь к Volume для медиа, напр. `/data` |
   | `ADMIN_BOOTSTRAP_TOKEN` | одноразовый токен для назначения первого админа |
   | `TELEGRAM_BOT_TOKEN` | (необязательно) уведомления о заявках/заказах |
   | `TELEGRAM_CHAT_ID` | (необязательно) чат для уведомлений |
   | `DATABASE_SSL` | `true` только если подключаетесь к БД по внешнему хосту с TLS |

4. **Подключите Volume для медиа** (иначе загруженные в CRM фото пропадут при
   редеплое). Сервис → *Settings → Volumes → New Volume*, mount path например
   `/data`, и выставьте `MEDIA_DIR=/data`.

5. **Деплой.** Запушьте в `main` (или *Deploy* в UI). В логах при первом старте
   увидите `[db] migrated + seeded`, дальше — `[db] migrated`.

6. **Назначьте первого администратора.** Зарегистрируйтесь на сайте (`/login`),
   затем один раз вызовите bootstrap:

   ```bash
   curl -X POST https://<ваш-домен>/api/auth/bootstrap-admin \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","token":"<ADMIN_BOOTSTRAP_TOKEN>"}'
   ```

   После этого войдите и откройте CRM: `https://<ваш-домен>/admin`.
   Токен `ADMIN_BOOTSTRAP_TOKEN` после этого можно удалить из переменных.

---

## Проверка после деплоя

```bash
curl https://<домен>/api/health           # {"ok":true,...}
curl https://<домен>/api/products?lang=ru  # список товаров из БД
```

## Локальный запуск (для разработки)

```bash
cp .env.example .env      # пропишите DATABASE_URL от локального Postgres
npm install
npm start                 # http://localhost:8080
```

Ручные команды БД (обычно не нужны — сервер делает это сам на старте):

```bash
npm run pg:migrate   # применить db/schema.pg.sql
npm run pg:seed      # наполнить данными из фронтенда, если пусто
```

---

## Что осталось от Cloudflare

Файлы `worker/index.ts`, `wrangler.toml`, `migrations/*` и npm-скрипты `cf:*`
оставлены в репозитории и Railway их не использует. Их можно удалить, если
деплой на Cloudflare больше не планируется.
