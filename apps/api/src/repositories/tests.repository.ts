import { prisma } from "@test-system/database/lib/prisma";
import { Test, User } from "@test-system/database/prisma/generated/client";

export interface UpdateTestData {
  title?: string;
  description?: string;
  pointsPerQuestion?: number | null;
  timeLimitMinutes?: number;
  isAlwaysAvailable?: boolean;
  availableFrom?: Date | null;
  availableUntil?: Date | null;
}

export class TestsRepository {
  static async createTest(test: Omit<Test, "id" | "createdAt">): Promise<Test> {
    return prisma.test.create({
      data: test,
    });
  }

  static async getAllTests(): Promise<Test[]> {
    return prisma.test.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getTestsByStudentAttempts(
    studentId: string
  ): Promise<Test[]> {
    // Get all tests that the student has attempted
    const attempts = await prisma.testAttempt.findMany({
      where: {
        studentId,
      },
      select: {
        testId: true,
      },
      distinct: ["testId"],
    });

    const testIds = attempts.map((attempt) => attempt.testId);

    if (testIds.length === 0) {
      return [];
    }

    return prisma.test.findMany({
      where: {
        id: {
          in: testIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getOneTest(
    id: string,
    includeRelations: boolean = false
  ): Promise<(Test & { createdBy?: Omit<User, "password">; questions?: any[] }) | null> {
    return prisma.test.findUnique({
      where: {
        id,
      },
      include: includeRelations
        ? {
            createdBy: {
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
              },
            },
            questions: {
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
            },
          }
        : undefined,
    });
  }

  static async updateTest(
    id: string,
    data: UpdateTestData
  ): Promise<Test> {
    return prisma.test.update({
      where: {
        id,
      },
      data,
    });
  }

  static async deleteTest(id: string): Promise<Test> {
    // Questions and options will be cascade deleted automatically
    return prisma.test.delete({
      where: {
        id,
      },
    });
  }
}
