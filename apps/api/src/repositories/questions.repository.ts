import { prisma } from "@test-system/database/lib/prisma";
import {
  Question,
  Option,
} from "@test-system/database/prisma/generated/client";

export interface CreateQuestionData {
  testId: string;
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
    order: number;
    explanation?: string;
  }>;
}

export interface UpdateQuestionData {
  text?: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
    order: number;
    explanation?: string;
  }>;
}

export class QuestionsRepository {
  static async createQuestion(
    data: CreateQuestionData
  ): Promise<Question & { options: Option[] }> {
    return prisma.question.create({
      data: {
        testId: data.testId,
        text: data.text,
        options: {
          create: data.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order,
            explanation: option.explanation,
          })),
        },
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async getQuestionById(
    id: string
  ): Promise<(Question & { options: Option[] }) | null> {
    return prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async getQuestionsByTestId(
    testId: string
  ): Promise<(Question & { options: Option[] })[]> {
    return prisma.question.findMany({
      where: { testId },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  static async updateQuestion(
    id: string,
    data: UpdateQuestionData
  ): Promise<Question & { options: Option[] }> {
    // If options are being updated, delete existing options and create new ones
    if (data.options) {
      // Delete existing options
      await prisma.option.deleteMany({
        where: { questionId: id },
      });

      // Create new options
      await prisma.option.createMany({
        data: data.options.map((option) => ({
          questionId: id,
          text: option.text,
          isCorrect: option.isCorrect,
          order: option.order,
          explanation: option.explanation,
        })),
      });
    }

    // Update question text if provided
    return prisma.question.update({
      where: { id },
      data: {
        text: data.text,
      },
      include: {
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  static async deleteQuestion(id: string): Promise<Question> {
    // Options will be cascade deleted automatically
    return prisma.question.delete({
      where: { id },
    });
  }
}
