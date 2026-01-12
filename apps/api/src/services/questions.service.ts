import {
  Question,
  Option,
} from "@test-system/database/prisma/generated/client";
import {
  QuestionsRepository,
  CreateQuestionData,
  UpdateQuestionData,
} from "src/repositories/questions.repository";
import { TestsRepository } from "src/repositories/tests.repository";
import { UserRole } from "src/types/enums";

export class QuestionsService {
  static async createQuestion(
    data: CreateQuestionData,
    userId: string,
    userRole: UserRole
  ): Promise<Question & { options: Option[] }> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(data.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Validate user owns the test or is admin
    if (test.createdById !== userId && userRole !== UserRole.ADMIN) {
      throw new Error(
        "Unauthorized: You can only add questions to your own tests"
      );
    }

    // Validate options
    this.validateOptions(data.options);

    return await QuestionsRepository.createQuestion(data);
  }

  static async getQuestionById(
    id: string
  ): Promise<(Question & { options: Option[] }) | null> {
    return await QuestionsRepository.getQuestionById(id);
  }

  static async getQuestionsByTestId(
    testId: string
  ): Promise<(Question & { options: Option[] })[]> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    return await QuestionsRepository.getQuestionsByTestId(testId);
  }

  static async updateQuestion(
    id: string,
    data: UpdateQuestionData,
    userId: string,
    userRole: UserRole
  ): Promise<Question & { options: Option[] }> {
    // Validate question exists
    const question = await QuestionsRepository.getQuestionById(id);
    if (!question) {
      throw new Error("Question not found");
    }

    // Validate test exists and user owns it
    const test = await TestsRepository.getOneTest(question.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    if (test.createdById !== userId && userRole !== UserRole.ADMIN) {
      throw new Error(
        "Unauthorized: You can only update questions in your own tests"
      );
    }

    // Validate options if provided
    if (data.options) {
      this.validateOptions(data.options);
    }

    return await QuestionsRepository.updateQuestion(id, data);
  }

  static async deleteQuestion(
    id: string,
    userId: string,
    userRole: UserRole
  ): Promise<Question> {
    // Validate question exists
    const question = await QuestionsRepository.getQuestionById(id);
    if (!question) {
      throw new Error("Question not found");
    }

    // Validate test exists and user owns it
    const test = await TestsRepository.getOneTest(question.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    if (test.createdById !== userId && userRole !== UserRole.ADMIN) {
      throw new Error(
        "Unauthorized: You can only delete questions from your own tests"
      );
    }

    return await QuestionsRepository.deleteQuestion(id);
  }

  private static validateOptions(
    options: Array<{
      text: string;
      isCorrect: boolean;
      order: number;
      explanation?: string;
    }>
  ): void {
    // At least 2 options required
    if (options.length < 2) {
      throw new Error("A question must have at least 2 options");
    }

    // Exactly one correct option
    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      throw new Error("A question must have exactly one correct option");
    }

    // Validate order uniqueness
    const orders = options.map((opt) => opt.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error("Option orders must be unique");
    }

    // Validate all options have text
    if (options.some((opt) => !opt.text || opt.text.trim() === "")) {
      throw new Error("All options must have text");
    }
  }
}
