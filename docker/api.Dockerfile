FROM node:18-alpine

WORKDIR /app

# Copy package files and workspace structure
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config

# Install dependencies
RUN npm install

# Copy remaining source code
COPY apps/api ./apps/api

# Generate Prisma client
RUN cd packages/database && npm run db:generate

# Build API
RUN cd apps/api && npm run build

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["npm", "start"]