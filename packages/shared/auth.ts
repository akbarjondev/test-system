import { User } from "@test-system/database/prisma/generated/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: Omit<User, "password">): string => {
  return jwt.sign({ ...user }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): Omit<User, "password"> => {
  return jwt.verify(token, process.env.JWT_SECRET || "secret") as Omit<
    User,
    "password"
  >;
};
