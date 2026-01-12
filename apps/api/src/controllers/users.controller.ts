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

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role as "ADMIN" | "STUDENT",
        createdAt: user.createdAt,
      });

      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role as "ADMIN" | "STUDENT",
          createdAt: user.createdAt,
        },
      };

      res.json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
