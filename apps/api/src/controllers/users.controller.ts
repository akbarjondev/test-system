import { User } from "@test-system/database/prisma/generated/client";
import { comparePassword, generateToken } from "@test-system/shared/auth";
import { AuthResponse, LoginRequest } from "@test-system/types";
import { UsersService } from "src/services/users.service";
import { Request, Response } from "express";

export class UsersController {
  static async registerUser(
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) {
    const { email, password } = req.body;
    const role = "STUDENT" as User["role"]; // Temporary fix for the role type

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const newUser = await UsersService.createUser({ email, password, role });
      const token = generateToken(newUser);
      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role as User["role"],
          createdAt: newUser.createdAt,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "User already exists or server error" });
    }
  }

  static async login(
    req: Request<{}, any, { email: string; password: string }>,
    res: Response
  ) {
    try {
      const { email, password }: LoginRequest = req.body;

      const user = await UsersService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password ?? "");
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        telegramId: user.telegramId,
        role: user.role as "ADMIN" | "STUDENT",
        createdAt: user.createdAt,
      });

      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          telegramId: user.telegramId,
          role: user.role as "ADMIN" | "STUDENT",
          createdAt: user.createdAt,
        },
      };

      res.json(response);
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      return res.json(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone,
          role: u.role,
          createdAt: u.createdAt,
        }))
      );
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async telegramAuth(req: Request, res: Response) {
    try {
      const { telegramId, fullName, phone } = req.body;
      const user = await UsersService.findOrCreateByTelegram({ telegramId, fullName, phone });
      const token = generateToken(user);
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          telegramId: user.telegramId,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateUserRole(
    req: Request<{ userId: string }, {}, { role: string }>,
    res: Response
  ) {
    const { userId } = req.params;
    const { role } = req.body;

    if (role !== "ADMIN" && role !== "STUDENT") {
      return res.status(400).json({ error: "Role must be ADMIN or STUDENT" });
    }

    try {
      const user = await UsersService.updateUserRole(userId, role as User["role"]);
      return res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error: any) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
