# TypeScript Path Aliases

The API uses `tsconfig-paths` with a `src` alias:

```typescript
// CORRECT — use src-relative path
import { UsersService } from "src/services/users.service";

// WRONG — don't use relative paths with ../../..
import { UsersService } from "../../services/users.service";
```

The dashboard uses `@` aliased to the app root:
```typescript
import { API_URL } from "@/config/constants";
```
