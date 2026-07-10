# Bententrade — QR, сайт и доработка CRM

Документ для команды CRM и бэкенда. Описывает **что добавить в CRM**, **зачем**, **какие API нужны сайту** и **как устроены сценарии**. Реализация на сайте идёт после согласования этой спецификации.

---

## 1. Цель интеграции

На каждый моток искусственного ротанга клеится бирка с QR-кодом. QR ведёт на сайт:

```
https://bententrade.uz/r/{qr_token}
```

Пример: `https://bententrade.uz/r/k4f82ms`

Сайт должен:

1. Распознать QR и показать страницу мотка.
2. Записать сканирование и все действия пользователя.
3. Требовать регистрацию для отзыва, корзины, заявки, вопросов и форм связи.
4. Закрепить пользователя за дилером, если он пришёл по QR дилера.
5. Передавать заявки и отзывы в CRM/админку с полным контекстом (QR, дилер, страна, товар).

**Критично:** старые QR-ссылки не должны ломаться. `qr_token` — постоянный идентификатор; меняется только статус/привязки, не URL.

---

## 2. Что уже есть на сайте (база)

| Есть сейчас | Не хватает для QR |
|-------------|-------------------|
| Каталог, корзина, checkout | Страница `/r/{qr_token}` |
| `POST /api/orders`, `POST /api/contact` | Привязка к QR и дилеру |
| Регистрация: email, password, name, phone | Имя/фамилия, страна, источник QR |
| Админка `/admin`: заказы, заявки, товары | QR, дилеры, события, отзывы |
| Telegram-уведомления | Единый поток событий в CRM |

Сайт и CRM могут быть **одной системой** (общая PostgreSQL + `/admin`) или **разными** (сайт шлёт HTTP в CRM). Ниже — модель данных и API, которые CRM должна поддерживать в любом случае.

---

## 3. Что добавить в CRM — сущности и зачем

### 3.1. Дилеры (`dealers`)

**Зачем:** маршрутизация заявок и отзывов; кабинет дилера; аналитика по QR.

| Поле | Тип | Обязательно | Зачем |
|------|-----|-------------|-------|
| `id` | int/uuid | да | PK |
| `code` | string | да | Короткий код (`emil_kg`, `almaty_kz`) |
| `name` | string | да | Имя для админки («Эмиль») |
| `country` | enum | да | `UZ`, `KG`, `KZ`, `RU`, `TJ`, `OTHER` |
| `phone` | string | нет | Для кнопки «Позвонить» |
| `telegram` | string | нет | Username или ссылка |
| `whatsapp` | string | нет | Номер для wa.me |
| `email` | string | нет | Дублирование заявок |
| `is_active` | bool | да | Выключенный дилер не получает новые лиды |
| `created_at` | datetime | да | Аудит |

**Правило маршрутизации заявок:**

- Пользователь пришёл по QR дилера → заявки идут **дилеру + Bententrade** (видимость у обоих).
- Пользователь выбрал страну с активным дилером, но без QR → заявка **только Bententrade** (или по правилу страны — настраивается).
- Страна без дилера → **только Bententrade**.

---

### 3.2. QR-коды (`qr_codes`)

**Зачем:** постоянная ссылка на моток; данные для лендинга после скана; привязка к дилеру и партии.

| Поле | Тип | Обязательно | Зачем |
|------|-----|-------------|-------|
| `id` | int/uuid | да | PK |
| `token` | string, unique | да | Публичный `qr_token` в URL (`k4f82ms`) |
| `status` | enum | да | `active`, `inactive`, `revoked` — старые URL открываются, но `inactive` показывает заглушку |
| `dealer_id` | FK → dealers | нет | Кому уходят заявки |
| `country` | enum | нет | Страна дилера/мотка |
| `motok_number` | string | нет | Номер мотка на бирке |
| `batch_code` | string | нет | Партия (если можно показывать) |
| `profile_id` | string | нет | Профиль ротанга (SKU/артикул профиля) |
| `profile_name` | string | нет | Отображение («Полумесяц 10 мм») |
| `color_id` | string | нет | ID цвета в каталоге |
| `color_name` | string | нет | Tobacco, Woody… |
| `weight_kg` | decimal | нет | Вес мотка |
| `product_id` | string | нет | Связь с карточкой каталога, если есть |
| `printed_at` | date | нет | Когда напечатали бирку |
| `notes` | text | нет | Внутренние заметки |
| `created_at` | datetime | да | Аудит |

**Важно для обратной совместимости:**

- `token` **никогда не переиспользуется** и не меняется.
- При смене дилера/партии обновляются FK-поля, URL остаётся тем же.
- `status = revoked` — страница «QR недействителен», но HTTP 200 (не 404).

---

### 3.3. Пользователи — расширение (`users`)

**Зачем:** регистрация по QR, закрепление за дилером, личный кабинет.

Добавить к существующей таблице пользователей:

| Поле | Тип | Зачем |
|------|-----|-------|
| `first_name` | string | Регистрация |
| `last_name` | string | Регистрация |
| `country` | enum | UZ, KG, KZ, RU, TJ, OTHER |
| `dealer_id` | FK → dealers | Закрепление после QR |
| `registration_source` | enum | `qr`, `site`, `catalog`, `admin` |
| `registration_qr_token` | string | Первый QR, с которого пришёл |
| `registered_at` | datetime | Момент завершения регистрации |

**Правило закрепления:**

При регистрации, если в запросе есть `qr_token` и QR привязан к `dealer_id` — записать `users.dealer_id` и не сбрасывать при последующих визитах (только вручную в CRM).

---

### 3.4. Атрибуция сессии (`user_attribution` или поля в сессии)

**Зачем:** помнить QR/дилера до и после регистрации (localStorage + серверная сессия).

| Поле | Тип | Зачем |
|------|-----|-------|
| `session_id` / `anonymous_id` | string | До регистрации |
| `user_id` | FK, nullable | После регистрации |
| `qr_token` | string | Текущий QR |
| `dealer_id` | FK | Из QR |
| `country` | enum | Из QR или выбор пользователя |
| `source` | string | `qr` |
| `landing_page` | string | `/r/k4f82ms` |
| `expires_at` | datetime | TTL 30–90 дней |

После регистрации строка связывается с `user_id`; сайт читает атрибуцию из API `GET /api/attribution`.

---

### 3.5. Журнал событий (`crm_events`)

**Зачем:** воронка, аналитика, админка «действия пользователя», отчёты дилерам.

| Поле | Тип | Зачем |
|------|-----|-------|
| `id` | bigint | PK |
| `event_type` | string | См. раздел 7 |
| `qr_token` | string, nullable | |
| `user_id` | int, nullable | |
| `anonymous_id` | string, nullable | До логина |
| `dealer_id` | FK, nullable | |
| `country` | enum, nullable | |
| `page_url` | string | |
| `product_id` | string, nullable | |
| `color_id` | string, nullable | |
| `profile_id` | string, nullable | |
| `payload` | json | Доп. данные |
| `user_agent` | string | |
| `ip_hash` | string | Без хранения сырого IP (опционально) |
| `created_at` | datetime | |

Индексы: `(event_type, created_at)`, `(qr_token)`, `(user_id)`, `(dealer_id)`.

**Зачем отдельная таблица, а не только Telegram:** CRM строит воронку, дилер видит только своих; можно фильтровать и экспортировать.

---

### 3.6. Сканирования QR (`qr_scans`)

**Зачем:** отдельный учёт сканов (даже без регистрации); список «все QR-переходы» в админке.

| Поле | Тип | Зачем |
|------|-----|-------|
| `id` | bigint | PK |
| `qr_token` | string | |
| `qr_code_id` | FK | |
| `dealer_id` | FK, nullable | |
| `user_id` | FK, nullable | Если уже залогинен |
| `anonymous_id` | string | |
| `user_agent` | string | |
| `referrer` | string | |
| `created_at` | datetime | |

Дублировать как `event_type = qr_scanned` в `crm_events` **можно** (для единой воронки), но отдельная таблица удобнее для отчёта «сколько раз сканировали моток X».

---

### 3.7. Заявки — расширение (`orders` / `leads`)

**Зачем:** заявка с QR-контекстом уходит нужному дилеру.

Добавить к заказам/заявкам:

| Поле | Тип | Зачем |
|------|-----|-------|
| `qr_token` | string | |
| `dealer_id` | FK | Кому назначена |
| `source` | enum | `qr`, `site`, `catalog` |
| `assigned_to` | enum | `dealer`, `bententrade`, `both` |
| `customer_country` | enum | |
| `customer_first_name` | string | |
| `customer_last_name` | string | |

Состав заявки — как сейчас (`order_items`: product_id, name, qty, price, color/profile в `options` json).

---

### 3.8. Отзывы (`reviews`)

**Зачем:** отзыв только после регистрации; модерация; привязка к мотку/дилеру.

| Поле | Тип | Зачем |
|------|-----|-------|
| `id` | int | PK |
| `user_id` | FK | Автор |
| `rating` | int 1–5 | Оценка |
| `text` | text | Текст |
| `status` | enum | `pending`, `approved`, `rejected` |
| `qr_token` | string, nullable | |
| `dealer_id` | FK, nullable | |
| `product_id` | string, nullable | |
| `profile_id` | string, nullable | |
| `color_id` | string, nullable | |
| `motok_number` | string, nullable | Из QR |
| `created_at` | datetime | |
| `moderated_at` | datetime | |
| `moderated_by` | FK user | |

**Медиа отзывов (`review_media`):** `review_id`, `media_key` / url, `sort`.

---

### 3.9. Справочник стран (`countries`)

Минимум для форм:

| code | label_ru |
|------|----------|
| UZ | Узбекистан |
| KG | Кыргызстан |
| KZ | Казахстан |
| RU | Россия |
| TJ | Таджикистан |
| OTHER | Другое |

Связь `dealers.country` → маршрутизация.

---

## 4. Что добавить в интерфейс CRM

### 4.1. Раздел «QR-коды»

- Список: token, статус, дилер, страна, моток, профиль, цвет, вес, дата печати.
- Создание/импорт пачки QR (CSV: token, dealer_code, motok, profile, color, weight).
- Карточка QR: история сканов, регистрации с этого QR, заявки, отзывы.
- **Не удалять token** — только `inactive` / `revoked`.

### 4.2. Раздел «Дилеры»

- CRUD дилеров, контакты, страна, активность.
- Счётчики: сканы, регистрации, заявки, конверсия.

### 4.3. Раздел «События» (лента)

- Фильтры: event_type, QR, дилер, пользователь, дата.
- Все 12 типов событий из раздела 7.

### 4.4. Пользователи — доработка карточки

- Имя, фамилия, телефон, страна.
- Источник: QR / сайт.
- Дилер закрепления.
- Первый `qr_token`.
- Вкладки: заявки, отзывы, корзина (снимок), события.

### 4.5. Заявки — доработка

- Колонки: source, qr_token, dealer, country.
- Назначение: дилер / Bententrade / оба.
- Уведомление дилеру (email/Telegram) — опционально в CRM.

### 4.6. Отзывы — новый раздел

- Очередь модерации (`pending`).
- Одобрить / отклонить.
- Просмотр фото.

### 4.7. Кабинет дилера (фаза 2)

- Только `dealer_id = текущий пользователь`.
- Пользователи и заявки с его QR или `users.dealer_id`.
- Без доступа к чужим QR и глобальным настройкам.

---

## 5. Структура страниц сайта

| URL | Страница | Назначение |
|-----|----------|------------|
| `/r/{qr_token}` | Лендинг после скана | Данные мотка, 4 CTA |
| `/register` | Регистрация | Модалка или отдельная страница; redirect после действия |
| `/login` | Вход | Для возвращающихся |
| `/catalog` | Каталог ротанга | Профили, цвета, цены, корзина |
| `/catalog?profile=…&color=…` | Фильтры | Запоминать dealer из сессии |
| `/product.html?id=…` | Карточка | Как сейчас + события |
| `/cart` / checkout | Корзина и заявка | С QR/dealer в payload |
| `/account` | Личный кабинет | Профиль, заявки, отзывы, избранное |
| `/review/new` | Форма отзыва | После регистрации; prefill из QR |
| `/contacts` | Контакты | Форма только для зарегистрированных |

**Редиректы после регистрации (query `?next=`):**

- `review` → форма отзыва
- `cart_add={product_id}` → добавить в корзину → каталог/корзина
- `checkout` → оформление заявки
- `contact` → форма связи

---

## 6. Пользовательские сценарии

### Сценарий A — Скан QR → отзыв

1. Пользователь сканирует QR → `/r/k4f82ms`.
2. Сайт: `GET /api/qr/k4f82ms` → данные мотка; `POST /api/events` `qr_scanned`.
3. Сохранить `qr_token`, `dealer_id` в localStorage + `POST /api/attribution`.
4. Нажимает «Оставить отзыв» → не авторизован → регистрация (имя, фамилия, телефон, страна + `qr_token`).
5. `POST /api/auth/register` → CRM: `registration_completed`, привязка `dealer_id`.
6. Открыть форму отзыва → `POST /api/reviews` → статус `pending`.
7. События: `review_started`, `review_submitted`.

### Сценарий B — Скан → каталог → корзина → заявка

1. Скан → лендинг (как A, шаги 1–3).
2. «Смотреть каталог» → `catalog_opened`; дилер в сессии.
3. Выбор цвета → `color_selected`.
4. «В корзину» без авторизации → регистрация → `cart_item_added`.
5. Оформление → `checkout_started` → `order_submitted` с `qr_token`, `dealer_id`, `source: qr`.
6. CRM: заявка видна Bententrade и дилеру Эмиля (KG).

### Сценарий C — Старый QR

1. Открыт `/r/old_token_2024`.
2. QR в БД, `status = active` → обычная страница.
3. Если `inactive` → сообщение «Моток подтверждён ранее», без ошибки 404.
4. Если `revoked` → «QR недействителен», контакты Bententrade.

### Сценарий D — Связаться с продавцом

1. Кнопка «Связаться» → если не авторизован, регистрация.
2. Показать WhatsApp/Telegram/звонок **дилера** (если есть), иначе Bententrade.
3. Событие `contact_channel_clicked` с `channel: telegram|whatsapp|phone`.

---

## 7. Типы событий для CRM

| # | `event_type` | Когда |
|---|--------------|-------|
| 1 | `qr_scanned` | Открыт `/r/{token}` |
| 2 | `registration_started` | Открыта форма регистрации |
| 3 | `registration_completed` | Успешный `POST /register` |
| 4 | `catalog_opened` | Переход в каталог |
| 5 | `product_viewed` | Открыта карточка товара |
| 6 | `color_selected` | Выбран цвет |
| 7 | `cart_item_added` | Товар в корзине |
| 8 | `checkout_started` | Начато оформление |
| 9 | `order_submitted` | Заявка отправлена |
| 10 | `review_started` | Открыта форма отзыва |
| 11 | `review_submitted` | Отзыв отправлен |
| 12 | `contact_channel_clicked` | WA / TG / звонок |

**Обязательные поля каждого события:**

```json
{
  "event_type": "cart_item_added",
  "qr_token": "k4f82ms",
  "user_id": 42,
  "anonymous_id": "anon_xxx",
  "dealer_id": 3,
  "country": "KG",
  "page_url": "/catalog",
  "product_id": "p12",
  "color_id": "tobacco",
  "profile_id": "0609",
  "timestamp": "2026-07-10T12:00:00Z",
  "user_agent": "Mozilla/5.0 ..."
}
```

Не все поля обязательны — передавать те, что есть в контексте.

---

## 8. API — что сайт будет вызывать (контракт для CRM/бэкенда)

Базовый префикс: `/api`. CRM может быть тем же Hono-сервером или принимать webhook с тем же телом.

### 8.1. QR

```
GET /api/qr/{qr_token}
```

**Ответ 200:**

```json
{
  "ok": true,
  "qr": {
    "token": "k4f82ms",
    "status": "active",
    "dealer": { "id": 3, "name": "Эмиль", "country": "KG", "phone": "...", "telegram": "...", "whatsapp": "..." },
    "country": "KG",
    "motok_number": "M-20481",
    "batch_code": "B-2026-04",
    "profile": { "id": "halfmoon_10", "name": "Полумесяц 10 мм" },
    "color": { "id": "tobacco", "name": "Tobacco" },
    "weight_kg": 25,
    "product_id": "rattan-halfmoon-10-tobacco"
  }
}
```

**Ответ 404:** только если token никогда не существовал.  
**Ответ 200 + `status: inactive|revoked`:** страница-заглушка, не ошибка.

---

### 8.2. Атрибуция (сессия QR)

```
POST /api/attribution
```

```json
{
  "qr_token": "k4f82ms",
  "anonymous_id": "anon_uuid",
  "page_url": "/r/k4f82ms",
  "country": "KG"
}
```

```
GET /api/attribution
```

Возвращает сохранённые `qr_token`, `dealer_id`, `country` для текущей сессии/анонима.

---

### 8.3. События

```
POST /api/events
```

Тело — объект из раздела 7. Ответ: `{ "ok": true, "id": 12345 }`.  
Rate limit: например 60/мин на anonymous_id.

---

### 8.4. Регистрация (расширенная)

```
POST /api/auth/register
```

```json
{
  "email": "user@mail.com",
  "password": "********",
  "first_name": "Айбек",
  "last_name": "Касымов",
  "phone": "+996555123456",
  "country": "KG",
  "qr_token": "k4f82ms",
  "dealer_id": 3,
  "source": "qr",
  "current_page": "/r/k4f82ms",
  "anonymous_id": "anon_uuid"
}
```

**CRM должна:**

1. Создать пользователя с новыми полями.
2. Закрепить `dealer_id` из QR (если валиден).
3. Записать `registration_completed`.
4. Связать `user_attribution` с `user_id`.

---

### 8.5. Заявка / заказ

```
POST /api/orders
```

Дополнительные поля к текущему payload:

```json
{
  "first_name": "Айбек",
  "last_name": "Касымов",
  "country": "KG",
  "qr_token": "k4f82ms",
  "dealer_id": 3,
  "source": "qr",
  "items": [ ... ]
}
```

**CRM:** назначить дилера, событие `order_submitted`, уведомления.

---

### 8.6. Отзыв

```
POST /api/reviews
```

Требует авторизацию.

```json
{
  "rating": 5,
  "text": "Отличный ротанг",
  "qr_token": "k4f82ms",
  "product_id": "...",
  "profile_id": "...",
  "color_id": "...",
  "photos": ["media_key_1"]
}
```

Ответ: `{ "ok": true, "id": 7, "status": "pending" }`.

---

### 8.7. Контакт / вопрос (только для авторизованных)

```
POST /api/contact
```

Добавить: `user_id`, `qr_token`, `dealer_id`, `country` — из сессии.

---

### 8.8. Webhook CRM ← сайт (если CRM отдельный сервис)

Опционально дублировать критичные события:

```
POST {CRM_WEBHOOK_URL}/events
POST {CRM_WEBHOOK_URL}/orders
POST {CRM_WEBHOOK_URL}/reviews
```

С подписью `X-BTT-Signature: HMAC-SHA256(body, secret)`.

---

## 9. Миграции БД (для общего бэкенда с сайтом)

Файлы для репозитория сайта (когда перейдёте к реализации):

```
migrations/0002_delivery_method.sql      — уже нужен для D1
migrations/0003_qr_and_dealers.sql       — dealers, qr_codes, qr_scans
migrations/0004_users_attribution.sql    — поля users, user_attribution
migrations/0005_crm_events.sql           — crm_events
migrations/0006_reviews.sql              — reviews, review_media
migrations/0007_orders_qr_fields.sql     — qr_token, dealer_id, source на orders
```

CRM-команда может применить **те же SQL** в своей БД или синхронизировать через API — главное, чтобы поля совпадали с контрактом выше.

---

## 10. Минимальная первая версия (MVP)

### CRM (приоритет)

1. Таблицы: `dealers`, `qr_codes`, `qr_scans`, `crm_events`.
2. Расширение `users` и `orders`.
3. Таблица `reviews` + модерация в админке.
4. API: `GET /api/qr/{token}`, `POST /api/events`, расширенный `register`, `orders`.
5. UI: список QR, список сканов, заявки с дилером, очередь отзывов.

### Сайт (следующий этап после CRM)

1. Страница `r.html` + роут `/r/{token}`.
2. Модуль `assets/qr.js` — атрибуция, события, localStorage.
3. Gate регистрации на действия.
4. Расширение форм register / checkout / review.
5. Админка: вкладки QR и события (или только в CRM, если это одно приложение).

---

## 11. Чеклист согласования перед разработкой

- [ ] CRM и сайт — **одна БД** или **CRM отдельно** (webhook)?
- [ ] Список дилеров MVP (Эмиль KG, …).
- [ ] Формат импорта QR (CSV полей).
- [ ] Показывать ли `batch_code` покупателю.
- [ ] Регистрация: email обязателен или достаточно телефона?
- [ ] Публикация отзывов на сайте после `approved`?
- [ ] Кто модерирует отзывы — только Bententrade или дилер тоже?

---

## 12. Связь с текущим кодом Bententrade-Sit

| Файл | Что менять при реализации |
|------|---------------------------|
| `db/schema.pg.sql` + `migrations/` | Новые таблицы из раздела 9 |
| `worker/routes/orders.ts` | Поля QR/dealer/source |
| `worker/routes/contact.ts` | Auth + атрибуция |
| `worker/routes/authRoutes.ts` | first_name, last_name, country, QR |
| `worker/routes/admin.ts` | UI списков QR, событий, отзывов |
| **Новые** `worker/routes/qr.ts`, `events.ts`, `reviews.ts` | API из раздела 8 |
| `assets/site.js`, `assets/cart.js` | События, gate регистрации |
| **Новые** `r.html`, `assets/qr.js` | Лендинг QR |

---

*Документ версии 1.0 — 2026-07-10. После согласования чеклиста из раздела 11 можно переходить к миграциям и коду на сайте.*
