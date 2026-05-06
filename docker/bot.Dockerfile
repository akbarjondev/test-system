FROM node:20-alpine
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

# Include devDeps — ts-node needed at runtime (see api.Dockerfile comment)
RUN npm install

COPY packages/database/prisma           packages/database/prisma
COPY packages/database/prisma.config.ts packages/database/prisma.config.ts
RUN cd packages/database && npm run db:generate

COPY packages             packages
COPY apps/telegram-bot    apps/telegram-bot

WORKDIR /app/apps/telegram-bot
ENV NODE_ENV=production

CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/bot.ts"]
