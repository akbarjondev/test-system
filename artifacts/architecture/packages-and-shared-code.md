# Packages and Shared Code

- **`packages/shared`** — exports `signToken(payload)` and `verifyToken(token)` using `jsonwebtoken`. Used by API for auth and by shared utilities.
- **`packages/types`** — shared TypeScript interfaces/enums used across apps and packages.
- **`packages/database`** — re-exports Prisma generated client. Import as `import { prisma } from "@test-system/database/generated/client"`.
- **`packages/ui`** — shared Radix/shadcn UI components for the dashboard.
