
# Bententrade Website

Готовый фронтенд проект для деплоя на Railway.

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Продакшен запуск (как на Railway)

```bash
npm run start
```

## Переменные окружения (Railway PostgreSQL)

Создайте `.env` на основе `.env.example`:

```env
DATABASE_URL=postgresql://...
DATABASE_SSL=true
API_TOKEN=your_api_token
ADMIN_PASSWORD=your_admin_password
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
VITE_API_BASE_URL=/api
VITE_API_TOKEN=your_api_token
```

При старте `server.js` автоматически создаёт таблицы `products` и `orders` в PostgreSQL.

## Railway

- Конфиг деплоя находится в `railway.json`
- Build: `npm install --include=dev && npm run build`
- Start: `npm run start`
  