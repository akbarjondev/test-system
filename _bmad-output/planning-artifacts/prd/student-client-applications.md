# Student client applications

| Phase | Client | Description |
|-------|--------|-------------|
| **Current (release)** | **Telegram Mini App** | Primary student experience: sign-in/registration, test unlock, attempt, submit, outcomes — delivered inside Telegram (Mini App UX; bot-style flows may remain for some steps per implementation). **No** dedicated student web property in the admin monorepo. |
| **Planned** | **Flutter app** | Native mobile client for learners; must implement the **same** attempt rules, scoring, and auth model as the Telegram client via the shared REST API. |
