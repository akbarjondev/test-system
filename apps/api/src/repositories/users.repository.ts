import { User } from "@test-system/database/prisma/generated/client";
import { prisma } from "@test-system/database/lib/prisma";

export class UsersRepository {
  static async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    return prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
        role: user.role,
      },
    });
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
