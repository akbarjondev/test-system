# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json                    apps/api/
COPY apps/admin-dashboard/package.json        apps/admin-dashboard/
COPY apps/telegram-bot/package.json           apps/telegram-bot/
COPY apps/mini-app/package.json               apps/mini-app/
COPY packages/database/package.json           packages/database/
COPY packages/shared/package.json             packages/shared/
COPY packages/types/package.json              packages/types/
COPY packages/ui/package.json                 packages/ui/
COPY packages/typescript-config/package.json  packages/typescript-config/
COPY packages/eslint-config/package.json      packages/eslint-config/

RUN npm install

COPY packages       packages
COPY apps/mini-app  apps/mini-app

# VITE_* vars are baked into the JS bundle at build time.
# Pass the public-facing API URL here.
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN cd apps/mini-app && npm run build

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/mini-app/dist /usr/share/nginx/html
COPY docker/nginx.mini-app.conf             /etc/nginx/conf.d/default.conf

EXPOSE 80
