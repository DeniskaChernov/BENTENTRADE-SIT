# Bententrade — архитектура экосистемы

Документ описывает **как устроены и связаны** сайт, CRM, Telegram-бот, базы данных и деплой.  
Дополняет [CRM-QR-INTEGRATION.md](./CRM-QR-INTEGRATION.md) (контракты QR/webhooks) и [DEPLOY.md](../DEPLOY.md) (деплой сайта на Cloudflare).

**Версия:** 1.0 · **Дата:** 2026-07-11

---

## 1. Обзор экосистемы

Три независимых приложения, одна бизнес-логика:

| Компонент | Назначение | Где живёт |
|-----------|------------|-----------|
| **Сайт** | Витрина, каталог, корзина, кабинет, cookie consent | Сейчас: Cloudflare Workers + Static Assets |
| **CRM** | Дилеры, QR, каталог (мастер), заказы, аналитика, печать бирок | Отдельный сервис (целевой хостинг — Railway) |
| **Telegram-бот** | Заказы, статусы, поддержка, уведомления клиенту | Отдельный сервис (Railway) |

```
                    ┌─────────────────────────────────────┐
                    │           Пользователь              │
                    └──────────────┬──────────────────────┘
           bententrade.uz          │              Telegram
                    │              │                  │
                    ▼              │                  ▼
            ┌──────────────┐       │         ┌────────────────┐
            │    Сайт      │       │         │  Telegram-бот  │
            │  (витрина)   │       │         │  (диалоги)     │
            └──────┬───────┘       │         └───────┬────────┘
                   │               │                 │
                   │    webhooks   │    REST API     │
                   └───────────────┼─────────────────┘
                                   ▼
                          ┌────────────────┐
                          │      CRM       │
                          │ источник правды│
                          └────────┬───────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
         site_db              crm_db              bot_db (опц.)
```

**Принцип:** CRM — **единственный источник правды** по статусам заказов, каталогу, QR, дилерам. Сайт и бот **только отображают** то, что CRM отдаёт или пушит через webhooks.

---

## 2. Monorepo на Railway (целевая структура)

Рекомендуемый репозиторий:

```
bententrade/
├── apps/
│   ├── site/              # статика + API (или прокси на Cloudflare)
│   ├── crm/               # бэкенд CRM + админка дилеров
│   └── telegram-bot/      # отдельный проект бота (из вашего репо)
├── packages/
│   └── shared/            # общие типы: OrderStatus, Product, webhook payloads
├── docs/
│   ├── ARCHITECTURE.md
│   └── CRM-QR-INTEGRATION.md
└── railway.toml           # или отдельные railway.json на сервис
```

### Сервисы Railway

| Сервис | Тип | Порт | Переменные |
|--------|-----|------|------------|
| `bententrade-crm` | Web (Node/Python/Go) | 3000 | `DATABASE_URL`, `CRM_API_SECRET`, webhook URLs |
| `bententrade-bot` | Worker (long-polling / webhook) | — | `TELEGRAM_BOT_TOKEN`, `CRM_API_BASE`, `CRM_API_KEY` |
| `bententrade-site` | *опционально* | 8080 | Если переносите с Cloudflare |

**Сейчас сайт уже на Cloudflare** (`BENTENTRADE-SIT` — один воркер: статика + `/api/*` + `/admin`). Перенос на Railway **не обязателен**: CRM и бот могут жить на Railway, сайт — на Cloudflare. Связь через HTTPS + webhooks.

---

## 3. Базы данных

### 3.1. Сколько БД

| БД | Владелец | Содержимое |
|----|----------|------------|
| **site_db** | Сайт | users, sessions, orders (кэш/зеркало), addresses, favorites, cookie consent metadata |
| **crm_db** | CRM | dealers, qr_codes, products (мастер), events, reviews, bulk_orders, печать QR |
| **bot_db** *(опционально)* | Бот | FSM-состояния диалогов, привязка `telegram_id ↔ crm_user_id` |

**Можно ли 3 компонента + 3 БД в одном проекте?** Да. Каждый сервис подключается **только к своей** БД. Бот **не ходит** в `site_db` напрямую — только в CRM API.

### 3.2. Текущее состояние сайта

Сейчас `site_db` = **Cloudflare D1** (SQLite), см. `wrangler.jsonc`, миграции в `migrations/`.

При переносе CRM на Railway логично использовать **PostgreSQL** для `crm_db`. Сайт может остаться на D1 или мигрировать на Postgres — отдельное решение.

---

## 4. Статусы заказов

### 4.1. Розница (мебель, кашпо, корзины)

Единая цепочка для сайта, CRM, кабинета и бота:

```
new → processing → shipped → delivered
                    ↘ cancelled (на любом этапе)
```

| Статус | RU | Когда ставит CRM |
|--------|-----|------------------|
| `new` | Новый | Заказ создан (сайт, бот, менеджер) |
| `processing` | В обработке | Подтверждён, комплектуется |
| `shipped` | В пути | Передан в доставку |
| `delivered` | Доставлен | Получен клиентом |
| `cancelled` | Отменён | Отмена по любой причине |

**UI на сайте (кабинет):** кнопки «Отследить» нет. Пользователь **нажимает на карточку заказа** — снизу раскрывается полоска этапов (чипы). Текущий этап подсвечен, пройденные — медь, будущие — серые.

**UI в Telegram-боте:** тот же смысл — список заказов → тап по заказу → inline-кнопки или текст с теми же 4 этапами и текущим статусом.

### 4.2. Опт ротанга от 100 кг (`bulk_orders`)

Отдельная сущность в CRM, **не смешивать** с розничными заказами:

```
inquiry → quote_sent → confirmed → production → ready → shipped → delivered
                              ↘ cancelled
```

| Статус | RU | Смысл |
|--------|-----|-------|
| `inquiry` | Заявка | Клиент оставил запрос (сайт/бот/менеджер) |
| `quote_sent` | КП отправлено | Менеджер выслал цену и сроки |
| `confirmed` | Подтверждён | Клиент согласился, объём ≥ 100 кг |
| `production` | В производстве | Плетение / закуп сырья |
| `ready` | Готов к отгрузке | На складе |
| `shipped` | Отгружен | В пути |
| `delivered` | Доставлен | Закрыт |

На сайте — отдельная вкладка или секция в кабинете «Оптовые заявки» (пока **не реализовано**).

---

## 5. Потоки данных

### 5.1. Создание розничного заказа

```
Корзина (сайт) → POST /api/orders → site_db
                        │
                        ├── webhook → CRM POST /orders
                        ├── Telegram notify (менеджеру)
                        └── если user_id есть → виден в кабинете
```

CRM присваивает `crm_order_id`, дальше **все смены статуса — в CRM**. CRM шлёт webhook на сайт:

```
POST https://bententrade.uz/api/sync/order-status
{ "public_id": "BT-2049", "status": "shipped", "updated_at": "..." }
```

Сайт обновляет запись в `site_db` → кабинет показывает новый этап.

### 5.2. Статус в Telegram-боте

```
Клиент: «Мои заказы»
    → бот: GET CRM /api/users/{telegram_id}/orders
    → список с текущим status

Клиент: тап «#BT-2049»
    → бот показывает те же этапы, что и на сайте (чипы / текст)
    → данные из CRM, не из site_db
```

### 5.3. Каталог

```
CRM (редактирование товара) → webhook POST /api/sync/product → site_db
Сайт отображает → GET /api/products (из своей БД)
```

Подробные поля — в [CRM-QR-INTEGRATION.md](./CRM-QR-INTEGRATION.md), разделы 3 и 8.

### 5.4. QR (будущее, по согласованию)

Лендинг `/r/{token}` описан в CRM-доке. **На сайте пока не реализован** (осознанно отложено). Когда будет — тот же CRM read API + webhooks событий.

---

## 6. Telegram: что есть сейчас vs что будет

| Сейчас (`worker/telegram.ts`) | Целевой бот (отдельный сервис) |
|-------------------------------|--------------------------------|
| `sendMessage` — уведомление менеджеру о новом заказе | Полноценный диалог с клиентом |
| Токен: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | Свой токен, webhook на Railway |
| Нет FSM, нет `/start`, нет статусов для клиента | Заказы, статусы, FAQ, связь с CRM |

**Интеграция бота из отдельного проекта:**

1. Перенести код в `apps/telegram-bot/` monorepo **или** подключить как git submodule.
2. Railway-сервис с `startCommand: node dist/index.js`.
3. Env: `CRM_API_BASE`, `CRM_API_KEY`, `TELEGRAM_BOT_TOKEN`.
4. Бот **никогда** не читает D1 сайта — только CRM REST + опционально `bot_db` для сессий.

---

## 7. Аутентификация и идентичность

| Канал | Сейчас | Целевое (MVP QR) |
|-------|--------|------------------|
| Сайт | email + пароль | телефон (без SMS), см. CRM-док |
| Бот | — | `telegram_id` → CRM user |
| Связка | `user_id` в заказе если залогинен | CRM хранит `site_user_id` + `telegram_id` |

Один человек может иметь и аккаунт на сайте, и диалог в боте — CRM склеивает по телефону.

---

## 8. Что реализовано на сайте (чеклист)

| Функция | Статус | Файлы |
|---------|--------|-------|
| Каталог, корзина, checkout | ✅ | `catalog.html`, `cart.js`, `POST /api/orders` |
| Кабинет: профиль, адреса, избранное | ✅ | `account.js`, `/api/me`, `/api/addresses` |
| Заказы в кабинете + этапы по клику | ✅ | `account.js`, `account.html` |
| Смена статуса менеджером | ✅ | `/admin` → `PUT /api/admin/orders/:id/status` |
| Синхронизация статусов из CRM | ❌ | Нужен webhook handler |
| Опт от 100 кг | ❌ | Только в этом доке + CRM-доке |
| QR `/r/{token}` | ❌ | Отложено |
| Полноценный Telegram-бот для клиента | ❌ | Только notify менеджеру |
| Регистрация по телефону | ❌ | План в CRM-доке |

---

## 9. Деплой: два сценария

### A. Гибрид (рекомендуется на старте)

| Компонент | Платформа |
|-----------|-----------|
| Сайт + site API + `/admin` | **Cloudflare** (как сейчас, см. DEPLOY.md) |
| CRM | **Railway** + PostgreSQL |
| Telegram-бот | **Railway** |

Связь: публичные HTTPS URL, shared secret на webhooks.

### B. Всё на Railway

Три сервиса, три БД (или site + crm на Postgres, bot на Redis). Статику сайта — Railway Static или CDN. Потребует переноса воркера с Cloudflare.

---

## 10. Переменные окружения (сводка)

### Сайт (Cloudflare secrets)

```
ADMIN_BOOTSTRAP_TOKEN
TELEGRAM_BOT_TOKEN      # уведомления менеджеру
TELEGRAM_CHAT_ID
CRM_WEBHOOK_SECRET      # (будущее) проверка подписи от CRM
CRM_API_BASE            # (будущее) чтение QR/каталога
```

### CRM (Railway)

```
DATABASE_URL
CRM_API_KEY
SITE_WEBHOOK_URL=https://bententrade.uz/api/webhooks/crm
SITE_WEBHOOK_SECRET
PARTNER_REVIEW_WEBHOOKS=...
```

### Telegram-бот (Railway)

```
TELEGRAM_BOT_TOKEN
CRM_API_BASE
CRM_API_KEY
BOT_DATABASE_URL        # опционально
```

---

## 11. Безопасность

- Cookie consent блокирует API до согласия (`assets/cookies.js`).
- Webhooks — HMAC-подпись или shared secret, rate limit.
- Бот и сайт не хранят пароли CRM; только API keys в env.
- `dealer_id` и имя дилера **никогда** не показываются пользователю на сайте.
- Админка сайта `/admin` — для операционки до полного CRM; в перспективе каталог и QR только из CRM.

---

## 12. Порядок внедрения

1. **CRM на Railway** — dealers, orders, смена статусов, админка.
2. **Webhooks CRM → сайт** — синхронизация статусов заказов (кабинет обновляется без перезагрузки).
3. **Telegram-бот** — перенос из отдельного репо, те же статусы что в кабинете.
4. **Sync каталога** CRM → сайт.
5. **Опт `bulk_orders`** — форма + кабинет + бот.
6. **QR** — по [CRM-QR-INTEGRATION.md](./CRM-QR-INTEGRATION.md), когда будет решение по `/r/{token}`.

---

## 13. Связанные документы

| Документ | Содержание |
|----------|------------|
| [CRM-QR-INTEGRATION.md](./CRM-QR-INTEGRATION.md) | QR, webhooks, поля БД, API-контракты |
| [CRM-AGENT-GUIDE.md](./CRM-AGENT-GUIDE.md) | Пошаговый план для агента CRM, границы ответственности |
| [DEPLOY.md](../DEPLOY.md) | Деплой сайта на Cloudflare |
| `worker/routes/orders.ts` | API заказов сайта |
| `assets/account.js` | Кабинет, раскрывающиеся этапы заказа |

---

*Вопросы по архитектуре — правки в этот файл. Контракты QR/API — в CRM-QR-INTEGRATION.md.*
