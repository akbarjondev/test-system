# Key Commands

```bash
npm run dev                                         # Start all apps locally (Turborepo)
npm run build                                       # Build all apps
npm run lint                                        # Lint all apps

# Docker — dev (all services, hot-reload, hardcoded creds)
npm run docker:dev                                  # Start full dev stack (Postgres + API + dashboard + bot + mini-app)
npm run docker:dev:down                             # Stop dev stack

# Docker — prod (all services, reads from .env at repo root)
npm run docker:prod                                 # Build & start prod stack (detached)
npm run docker:prod:down                            # Stop prod stack

cd packages/database && npm run db:migrate          # prisma migrate dev (create + apply)
cd packages/database && npm run db:generate         # Regenerate Prisma client after schema change
cd packages/database && npm run db:studio           # Open Prisma Studio

cd apps/api && npm run seed:admin                   # Seed initial admin user
```

---
