import { Test } from "@test-system/database/prisma/generated/client";
import { Request, Response } from "express";
import { TestsService } from "src/services/tests.service";
import { UserRole } from "src/types/enums";
import { PaginationParams } from "@test-system/types";

export interface UpdateTestRequest {
  title?: string;
  description?: string;
  pointsPerQuestion?: number | null;
  timeLimitMinutes?: number;
  isAlwaysAvailable?: boolean;
  availableFrom?: string | null; // ISO date string
  availableUntil?: string | null; // ISO date string
  testPassword?: string | null;
  allowOnlyOneAttempt?: boolean;
  passingScore?: number | null;
}

export class TestsController {
  static async createTest(
    req: Request<
      {},
      any,
      Omit<Test, "id" | "createdAt" | "createdById"> & { user?: any }
    >,
    res: Response
  ) {
    const {
      title,
      description,
      pointsPerQuestion,
      timeLimitMinutes,
      isAlwaysAvailable,
      availableFrom,
      availableUntil,
      testPassword,
      allowOnlyOneAttempt,
      passingScore,
    } = req.body;

    // Get user from request (set by auth middleware)
    const createdById = req.user.id;
    try {
      const newTest: Test = await TestsService.createTest({
        title,
        description,
        createdById,
        pointsPerQuestion,
        timeLimitMinutes: timeLimitMinutes ?? 30, // Default to 30 if not provided
        isAlwaysAvailable: isAlwaysAvailable ?? true,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null,
        testPassword: testPassword ?? null,
        allowOnlyOneAttempt: allowOnlyOneAttempt ?? false,
        passingScore: passingScore ?? null,
      });
      return res.status(201).json(newTest);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to create test" });
    }
  }

  static async getAllTests(req: Request, res: Response) {
    try {
      // Parse and validate pagination parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        1000,
        Math.max(1, parseInt(req.query.limit as string) || 20)
      );

      const pagination: PaginationParams = { page, limit };

      const result = await TestsService.getAllTests(
        req.user.id,
        req.user.role as UserRole,
        pagination
      );
      return res.json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to fetch tests" });
    }
  }

  static async getTestById(req: Request<{ testId: string }>, res: Response) {
    try {
      const { testId } = req.params;
      // Include relations (questions with options and creator info)
      const test = await TestsService.getTestById(testId, true);

      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      return res.json(test);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to fetch test" });
    }
  }

  static async updateTest(
    req: Request<{ testId: string }, any, UpdateTestRequest>,
    res: Response
  ) {
    try {
      const { testId } = req.params;
      const {
        title,
        description,
        pointsPerQuestion,
        timeLimitMinutes,
        isAlwaysAvailable,
        availableFrom,
        availableUntil,
        testPassword,
        allowOnlyOneAttempt,
        passingScore,
      } = req.body;

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (pointsPerQuestion !== undefined)
        updateData.pointsPerQuestion = pointsPerQuestion;
      if (timeLimitMinutes !== undefined)
        updateData.timeLimitMinutes = timeLimitMinutes;
      if (isAlwaysAvailable !== undefined)
        updateData.isAlwaysAvailable = isAlwaysAvailable;
      if (availableFrom !== undefined)
        updateData.availableFrom = availableFrom
          ? new Date(availableFrom)
          : null;
      if (availableUntil !== undefined)
        updateData.availableUntil = availableUntil
          ? new Date(availableUntil)
          : null;
      if (testPassword !== undefined) updateData.testPassword = testPassword ?? null;
      if (allowOnlyOneAttempt !== undefined) updateData.allowOnlyOneAttempt = allowOnlyOneAttempt;
      if (passingScore !== undefined) updateData.passingScore = passingScore ?? null;

      const test = await TestsService.updateTest(
        testId,
        updateData,
        req.user.id,
        req.user.role as UserRole
      );

      return res.json(test);
    } catch (error: any) {
      console.log(error);

      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to update test" });
    }
  }

  static async deleteTest(req: Request<{ testId: string }>, res: Response) {
    try {
      const { testId } = req.params;
      await TestsService.deleteTest(
        testId,
        req.user.id,
        req.user.role as UserRole
      );

      return res.status(204).send();
    } catch (error: any) {
      console.log(error);

      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to delete test" });
    }
  }

  static async unlockTest(req: Request, res: Response) {
    try {
      const test = await TestsService.unlockTest(req.body.testPassword);
      const { testPassword: _, ...testData } = test;
      return res.status(200).json(testData);
    } catch (error) {
      if (error instanceof Error && error.message === "TEST_NOT_FOUND") {
        return res.status(404).json({ error: "Test topilmadi", code: "TEST_NOT_FOUND" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
