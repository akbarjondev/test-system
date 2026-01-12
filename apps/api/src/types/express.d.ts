import { User } from "@test-system/database/prisma/generated/client";

declare global {
  namespace Express {
    export interface Request {
      user: Omit<User, "password">;
    }
  }
}

// Ensure this file is treated as a module
export {};
