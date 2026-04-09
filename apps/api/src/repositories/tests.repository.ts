import { prisma } from "@test-system/database/lib/prisma";
import { Option, Question, Test, User } from "@test-system/database/prisma/generated/client";
import { PaginationParams, PaginatedResponse } from "@test-system/types";

export interface UpdateTestData {
  title?: string;
  description?: string;
  pointsPerQuestion?: number | null;
  timeLimitMinutes?: number;
  isAlwaysAvailable?: boolean;
  availableFrom?: Date | null;
  availableUntil?: Date | null;
  testPassword?: string | null;
  allowOnlyOneAttempt?: boolean;
  passingScore?: number | null;
}

export class TestsRepository {
  static async createTest(test: Omit<Test, "id" | "createdAt">): Promise<Test> {
    return prisma.test.create({
      data: test,
    });
  }

  static async getAllTests(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Test>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.test.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.test.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getAvailableTests(
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Test>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where = {
      OR: [
        { isAlwaysAvailable: true },
        {
          isAlwaysAvailable: false,
          availableFrom: { lte: now },
          availableUntil: { gte: now },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.test.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getTestsByStudentAttempts(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Test>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

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
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.test.findMany({
        where: {
          id: {
            in: testIds,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.test.count({
        where: {
          id: {
            in: testIds,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  static async getOneTest(
    id: string,
    includeRelations: boolean = false
  ): Promise<(Test & { createdBy?: Omit<User, "password">; questions?: (Question & { options: Option[] })[] }) | null> {
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

  static async findByPassword(testPassword: string): Promise<Test | null> {
    return prisma.test.findFirst({
      where: { testPassword },
    });
  }
}
