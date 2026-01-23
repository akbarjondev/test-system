# Development Mode Setup - AI Agent Rules

## Purpose
This document defines the standard workflow for running the development environment. When a user requests to "run app in dev mode" or similar requests, follow these instructions exactly.

## Required Actions

When asked to run the application in development mode, you MUST execute the following commands in separate terminals:

### Terminal 1: Database Container
**Command**: `npm run docker:dev`  
**Location**: Project root directory  
**Purpose**: Starts PostgreSQL database container using Podman Compose  
**Details**:
- Port: 5432
- Database: `testdb`
- User: `postgres`
- Password: `password`
- Uses `podman compose` (configured in package.json)

### Terminal 2: Turbo Development Server
**Command**: `npm run dev`  
**Location**: Project root directory  
**Purpose**: Runs Turborepo dev task which starts all apps:
- `admin-dashboard`: Next.js dev server (port 3000)
- `api`: Express API with nodemon (port 5000)

### Terminal 3: Prisma Studio
**Command**: `cd packages/database && npm run db:studio`  
**Location**: `packages/database` directory  
**Purpose**: Opens Prisma Studio GUI for database management  
**Port**: 5555

## Execution Order

1. Start Terminal 1 (Database)
2. Start Terminal 2 (Turbo Dev)
3. Start Terminal 3 (Prisma Studio)

All terminals should remain running. Use background execution or keep terminals open for monitoring.

## Stopping Services

- Database: `npm run docker:down` (from project root)
- Turbo: `Ctrl+C` in Terminal 2
- Prisma Studio: `Ctrl+C` in Terminal 3

## File References

- Docker Compose: `docker/docker-compose.yml`
- Root package.json: `package.json`
- Database package.json: `packages/database/package.json`
- Turbo config: `turbo.json`
