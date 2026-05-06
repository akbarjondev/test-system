# Docker Patterns

### Two Compose Files
| File | Purpose | Creds |
|------|---------|-------|
| `docker/docker-compose.yml` | Dev — all services, bind mounts, hot-reload | Hardcoded |
| `docker/docker-compose.prod.yml` | Prod — built images, no mounts | `.env` at repo root |

### Dev Stack (`docker-compose.yml`)
- All services use a single `docker/dev.Dockerfile` (installs deps, pre-generates Prisma client)
- Source code bind-mounted into `/app` — edits reflect immediately without rebuilds
- Hardcoded values: Postgres `postgres/password`, JWT `dev-secret-change-in-prod`
- `npm run docker:dev` starts everything; `npm run docker:dev:down` stops it

### Prod Stack (`docker-compose.prod.yml`)
- Per-service Dockerfiles: `api.Dockerfile`, `admin.Dockerfile`, `bot.Dockerfile`, `mini-app.Dockerfile`
- Requires `.env` at **repo root** (copy from `docker/.env.example`, fill in secrets)
- `npm run docker:prod` builds + starts detached; `npm run docker:prod:down` stops it
- Mini-app served by nginx on port **80**; API on **5000**; dashboard on **3000**

### Critical Behaviours
- API container runs `npx prisma migrate deploy` **automatically on startup** — do not run migrations manually when using Docker
- `VITE_API_URL` build arg is baked into the mini-app JS bundle at image build time — changing it requires a rebuild
- `NEXT_PUBLIC_API_URL` is set both as a build arg and runtime env var in prod compose (dashboard uses internal `http://api:5000`)
- `.env*` files are excluded from Docker build context via `.dockerignore` — secrets never leak into images

---
