import { User } from "@test-system/database/prisma/generated/client";
import { hashPassword } from "@test-system/shared/auth";
import { UsersRepository } from "src/repositories/users.repository";
import { createHmac } from "crypto";

export class UsersService {
  static async createUser(user: { email: string; password: string; role: User["role"] }): Promise<User> {
    const existingUser = await UsersRepository.getUserByEmail(user.email ?? "");
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(user.password ?? "");

    const newUser = await UsersRepository.createUser({
      ...user,
      password: hashedPassword,
    });

    return newUser;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return UsersRepository.getUserByEmail(email);
  }

  static async getUserById(id: string): Promise<User | null> {
    return UsersRepository.getUserById(id);
  }

  static async getAllUsers(): Promise<User[]> {
    return UsersRepository.getAllUsers();
  }

  static async updateUserRole(id: string, role: User["role"]): Promise<User> {
    const user = await UsersRepository.getUserById(id);
    if (!user) throw new Error("User not found");
    return UsersRepository.updateUserRole(id, role);
  }

  static async findOrCreateByTelegram(data: {
    telegramId: string;
    fullName: string;
    phone: string;
  }): Promise<User> {
    const existing = await UsersRepository.findByTelegramId(data.telegramId);
    if (existing) return existing;
    return UsersRepository.createTelegramUser(data);
  }

  static async findOrCreateByTelegramMiniApp(data: {
    telegramId: string;
    fullName: string;
  }): Promise<User> {
    return UsersRepository.upsertTelegramUser(data);
  }

  static validateInitData(initData: string, botToken: string): {
    valid: boolean;
    expired: boolean;
    telegramId?: string;
    fullName?: string;
  } {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false, expired: false };

    params.delete("hash");

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (computedHash !== hash) return { valid: false, expired: false };

    const authDate = parseInt(params.get("auth_date") ?? "0", 10);
    const expired = Math.floor(Date.now() / 1000) - authDate > 86400;
    if (expired) return { valid: true, expired: true };

    const userJson = params.get("user");
    let user = null;
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      return { valid: false, expired: false };
    }
    const telegramId = String(user?.id ?? "");
    if (!telegramId) return { valid: false, expired: false };
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

    return { valid: true, expired: false, telegramId, fullName };
  }
}
