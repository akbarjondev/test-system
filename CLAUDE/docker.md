# Docker

Two compose files, both under `docker/`, build context is always the repo root (`..`):

| File                          | Purpose                                      |
|-------------------------------|----------------------------------------------|
| `docker/docker-compose.yml`   | Dev — all services, volume mounts, hot-reload |
| `docker/docker-compose.prod.yml` | Prod — built images, no mounts           |

**Dev stack** (`docker-compose.yml`): all services share a single `docker/dev.Dockerfile` that installs deps and pre-generates the Prisma client. Source code is bind-mounted, so changes reflect immediately. Credentials are hardcoded (Postgres: `postgres/password`, JWT: `dev-secret-change-in-prod`).

**Prod stack** (`docker/docker-compose.prod.yml`): each service has its own Dockerfile (`api.Dockerfile`, `admin.Dockerfile`, `bot.Dockerfile`, `mini-app.Dockerfile`). Reads secrets from a `.env` file at the **repo root** — copy `docker/.env.example` and fill in values before first run.

Key behaviours:
- API container runs `prisma migrate deploy` automatically on startup (both dev and prod)
- `VITE_API_URL` must be a browser-reachable URL (not `http://api:5000`) — the mini-app JS runs in the user's browser
- Mini-app is served by nginx on port 80 in prod, by Vite dev server on port 5173 in dev

---
