import { Test } from "@test-system/database/prisma/generated/client";
import { Request, Response } from "express";
import { TestsService } from "src/services/tests.service";

export class TestsController {
  static async createTest(
    req: Request<
      {},
      any,
      Omit<Test, "id" | "createdAt" | "createdById"> & { user?: any }
    >,
    res: Response
  ) {
    const { title, description, score } = req.body;

    // Get user from request (set by auth middleware)
    const createdById = req.user.id;
    try {
      const newTest: Test = await TestsService.createTest({
        title,
        description,
        createdById,
        score,
      });
      return res.status(201).json(newTest);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to create test" });
    }
  }
}
