import { User } from "@test-system/database/prisma/generated/client";
import { verifyToken } from "@test-system/shared/auth";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "src/services/users.service";
import { UserRole } from "src/types/enums";

export const verifyTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "Token is required",
    });
  }

  const [tokenType, token] = authHeader.split(" ");

  if (tokenType !== "Bearer" || !token) {
    return res.status(403).json({
      error: "Invalid Token",
    });
  }

  try {
    const user = verifyToken(token);
    req.user = user;

    // check if user exits
    const isUserExist = await UsersService.getUserByEmail(user.email);

    if (!isUserExist) {
      return res.status(404).json({
        error: "User does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      error: "Invalid Token",
    });
  }

  return next();
};

export const verifyAdminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user.role !== UserRole.ADMIN) {
    return res.status(403).json({
      error: "User not admin",
    });
  }

  return next();
};
