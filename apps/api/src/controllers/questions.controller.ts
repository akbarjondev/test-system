import {
  Question,
  Option,
} from "@test-system/database/prisma/generated/client";
import { Request, Response } from "express";
import { QuestionsService } from "src/services/questions.service";
import { UserRole } from "src/types/enums";

export interface CreateQuestionRequest {
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    order: number;
    explanation?: string;
  }>;
}

export interface UpdateQuestionRequest {
  text?: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
    order: number;
    explanation?: string;
  }>;
}

export class QuestionsController {
  static async createQuestion(
    req: Request<{ testId: string }, any, CreateQuestionRequest>,
    res: Response,
  ) {
    try {
      const { testId } = req.params;
      const { text, options } = req.body;

      if (!text || !options) {
        return res.status(400).json({
          error: "Text and options are required",
        });
      }

      const question = await QuestionsService.createQuestion(
        {
          testId,
          text,
          options,
        },
        req.user.id,
        req.user.role as UserRole,
      );

      return res.status(201).json(question);
    } catch (error: any) {
      console.log(error);

      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      if (
        error.message.includes("must have") ||
        error.message.includes("must be")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to create question" });
    }
  }

  static async getQuestionsByTest(
    req: Request<{ testId: string }>,
    res: Response,
  ) {
    try {
      const { testId } = req.params;
      const questions = await QuestionsService.getQuestionsByTestId(testId);
      return res.json(questions);
    } catch (error: any) {
      console.log(error);

      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to fetch questions" });
    }
  }

  static async getQuestionById(
    req: Request<{ questionId: string }>,
    res: Response,
  ) {
    try {
      const { questionId } = req.params;
      const question = await QuestionsService.getQuestionById(questionId);

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      return res.json(question);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to fetch question" });
    }
  }

  static async updateQuestion(
    req: Request<{ questionId: string }, any, UpdateQuestionRequest>,
    res: Response,
  ) {
    try {
      const { questionId } = req.params;
      const { text, options } = req.body;

      const question = await QuestionsService.updateQuestion(
        questionId,
        { text, options },
        req.user.id,
        req.user.role as UserRole,
      );

      return res.json(question);
    } catch (error: any) {
      console.log(error);

      if (
        error.message === "Question not found" ||
        error.message === "Test not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      if (
        error.message.includes("must have") ||
        error.message.includes("must be")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to update question" });
    }
  }

  static async deleteQuestion(
    req: Request<{ questionId: string }>,
    res: Response,
  ) {
    try {
      const { questionId } = req.params;
      await QuestionsService.deleteQuestion(
        questionId,
        req.user.id,
        req.user.role as UserRole,
      );

      return res.status(204).send();
    } catch (error: any) {
      console.log(error);

      if (
        error.message === "Question not found" ||
        error.message === "Test not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to delete question" });
    }
  }
}
