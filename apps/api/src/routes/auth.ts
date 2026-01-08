import express from "express";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "@test-system/shared/auth";
import type { LoginRequest, AuthResponse } from "@test-system/types";
import { prisma } from "@test-system/database/lib/prisma";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
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
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "User already exists or server error" });
  }
});

export default router;
