# Model: `User`

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| id          | String   | CUID, PK                           |
| email       | String   | Unique                             |
| password    | String   | bcrypt hash                        |
| role        | Role     | Default: STUDENT                   |
| createdAt   | DateTime | Auto                               |

**Business context:** Single user table for both admins and students. Role is the discriminator. The seed script creates the first ADMIN. Students self-register via `/api/auth/register` (default role = STUDENT); an admin can promote them via `PUT /api/users/:userId`.

---
