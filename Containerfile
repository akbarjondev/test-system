FROM node:20-alpine
WORKDIR /app

# Copy all workspace manifests first — layer is cached until any package.json changes
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

# Pre-generate Prisma client so TS types are resolvable at dev startup
COPY packages/database/prisma           packages/database/prisma
COPY packages/database/prisma.config.ts packages/database/prisma.config.ts
RUN cd packages/database && npm run db:generate
