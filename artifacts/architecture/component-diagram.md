# Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            CLIENTS                                        │
│                                                                           │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐  │
│  │  Admin Browser  │    │  Telegram User   │    │   Flutter App      │  │
│  │  (ADMIN role)   │    │  (STUDENT role)  │    │  (STUDENT role)    │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────────┬──────────┘  │
└───────────┼─────────────────────┼──────────────────────────┼────────────┘
            │ HTTPS               │ Telegram API              │ HTTPS
            ▼                     ▼                           │
┌───────────────────┐    ┌─────────────────┐                 │
│  Next.js Dashboard│    │  Telegram Bot   │                 │
│  (apps/admin-     │    │  (apps/telegram-│                 │
│   dashboard)      │    │   bot, grammy)  │                 │
│  Port: 3000       │    │                 │                 │
│                   │    │  Long polling   │                 │
│  proxy.ts         │    │  (→ webhook in  │                 │
│  (cookie→Bearer)  │    │   production)   │                 │
└────────┬──────────┘    └────────┬────────┘                 │
         │ Bearer JWT             │ Bearer JWT                │ Bearer JWT
         └────────────────────────┴──────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Express API            │
                    │  (apps/api)             │
                    │  Port: 5000             │
                    │                         │
                    │  helmet → cors →        │
                    │  json → rate-limit →    │
                    │  router → validate →    │
                    │  verifyToken →          │
                    │  verifyAdmin →          │
                    │  Controller →           │
                    │  Service →              │
                    │  Repository →           │
                    │  Prisma Client          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  PostgreSQL            │
                    │  (managed add-on in    │
                    │   production; local    │
                    │   Docker in dev)       │
                    └────────────────────────┘
```

---
