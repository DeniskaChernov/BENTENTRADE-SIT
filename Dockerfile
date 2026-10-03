# Образ без Nixpacks/Caddy: один процесс node server.js (API + статика из build/).
# Railway: задайте переменные (DATABASE_URL, API_TOKEN, ADMIN_PASSWORD, ADMIN_JWT_SECRET и т.д.).
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/build ./build
COPY server.js cms-api.js admin-auth.js ./
EXPOSE 3000
CMD ["node", "server.js"]
