import { User } from "@test-system/database/prisma/generated/client";
import { prisma } from "@test-system/database/lib/prisma";

export class UsersRepository {
  static async createUser(user: { email: string; password: string; role: User["role"] }): Promise<User> {
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

  static async findByTelegramId(telegramId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { telegramId } });
  }

  static async createTelegramUser(data: {
    telegramId: string;
    fullName: string;
    phone?: string | null;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        telegramId: data.telegramId,
        fullName: data.fullName,
        phone: data.phone ?? null,
        role: "STUDENT",
      },
    });
  }

  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  }

  static async updateUserRole(id: string, role: User["role"]): Promise<User> {
    return prisma.user.update({ where: { id }, data: { role } });
  }

  static async upsertTelegramUser(data: {
    telegramId: string;
    fullName: string;
  }): Promise<User> {
    return prisma.user.upsert({
      where: { telegramId: data.telegramId },
      update: { fullName: data.fullName },
      create: {
        telegramId: data.telegramId,
        fullName: data.fullName,
        phone: null,
        role: "STUDENT",
      },
    });
  }
}
