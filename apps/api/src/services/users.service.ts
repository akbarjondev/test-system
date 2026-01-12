import { User } from "@test-system/database/prisma/generated/client";
import { hashPassword } from "@test-system/shared/auth";
import { UsersRepository } from "src/repositories/users.repository";

export class UsersService {
  static async createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
    const existingUser = await UsersRepository.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(user.password);

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
}
