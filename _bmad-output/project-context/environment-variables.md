# Environment Variables

### API (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=<strong secret>
PORT=5000  (optional, defaults to 5000)
```

### Dashboard (`apps/admin-dashboard/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Telegram Bot (`apps/telegram-bot/.env`)
```
TELEGRAM_BOT_TOKEN=<bot token>
API_URL=http://localhost:5000
```

---
