import { prisma } from "@test-system/database/lib/prisma";
import {
  TestAttempt,
  Question,
  Option,
  Answer,
  QuestionOrder,
} from "@test-system/database/prisma/generated/client";

export interface CreateAttemptData {
  testId: string;
  studentId: string;
  questionIds: string[]; // Shuffled question IDs
}

export interface AttemptWithRelations extends TestAttempt {
  test?: {
    id: string;
    title: string;
    timeLimitMinutes: number;
    pointsPerQuestion: number | null;
  };
  questionOrders?: (QuestionOrder & {
    question: Question & { options: Option[] };
  })[];
  answers?: Answer[];
}

export class AttemptsRepository {
  static async createAttempt(
    data: CreateAttemptData
  ): Promise<TestAttempt & { questionOrders: QuestionOrder[] }> {
    // Create attempt
    const attempt = await prisma.testAttempt.create({
      data: {
        testId: data.testId,
        studentId: data.studentId,
      },
    });

    // Create question orders (shuffled order)
    const questionOrders = await Promise.all(
      data.questionIds.map((questionId, index) =>
        prisma.questionOrder.create({
          data: {
            attemptId: attempt.id,
            questionId,
            displayOrder: index,
          },
        })
      )
    );

    // Create empty answers for all questions
    await Promise.all(
      data.questionIds.map((questionId) =>
        prisma.answer.create({
          data: {
            attemptId: attempt.id,
            questionId,
            optionId: null,
            pointsEarned: 0,
          },
        })
      )
    );

    return { ...attempt, questionOrders };
  }

  static async getAttemptById(
    id: string,
    includeRelations: boolean = false
  ): Promise<AttemptWithRelations | null> {
    return prisma.testAttempt.findUnique({
      where: { id },
      include: includeRelations
        ? {
            test: {
              select: {
                id: true,
                title: true,
                timeLimitMinutes: true,
                pointsPerQuestion: true,
              },
            },
            questionOrders: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: {
                        order: "asc",
                      },
                    },
                  },
                },
              },
              orderBy: {
                displayOrder: "asc",
              },
            },
            answers: {
              orderBy: {
                answeredAt: "asc",
              },
            },
          }
        : undefined,
    }) as Promise<AttemptWithRelations | null>;
  }

  static async findCompletedAttemptByTestAndStudent(
    testId: string,
    studentId: string
  ): Promise<TestAttempt | null> {
    return prisma.testAttempt.findFirst({
      where: {
        testId,
        studentId,
        OR: [
          { submittedAt: { not: null } },
          { timedOutAt: { not: null } },
        ],
      },
    });
  }

  static async getActiveAttemptByTestAndStudent(
    testId: string,
    studentId: string
  ): Promise<AttemptWithRelations | null> {
    return prisma.testAttempt.findFirst({
      where: {
        testId,
        studentId,
        submittedAt: null, // Not submitted yet
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            timeLimitMinutes: true,
            pointsPerQuestion: true,
          },
        },
        questionOrders: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: {
                    order: "asc",
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        answers: {
          orderBy: {
            answeredAt: "asc",
          },
        },
      },
    }) as Promise<AttemptWithRelations | null>;
  }

  static async updateAnswer(
    attemptId: string,
    questionId: string,
    optionId: string | null
  ): Promise<Answer> {
    return prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        optionId,
        answeredAt: new Date(),
      },
      create: {
        attemptId,
        questionId,
        optionId,
        pointsEarned: 0, // Will be calculated on submission
        answeredAt: new Date(),
      },
    });
  }

  static async submitAttempt(
    attemptId: string,
    score: number
  ): Promise<TestAttempt> {
    return prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score,
      },
    });
  }

  static async setTimedOut(attemptId: string): Promise<void> {
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: { timedOutAt: new Date() },
    });
  }

  static async getAttemptsByStudent(studentId: string): Promise<TestAttempt[]> {
    return prisma.testAttempt.findMany({
      where: { studentId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            timeLimitMinutes: true,
            pointsPerQuestion: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  static async getAttemptsByTest(testId: string): Promise<TestAttempt[]> {
    return prisma.testAttempt.findMany({
      where: { testId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  static async getAllAttempts(
    pagination?: { page?: number; limit?: number }
  ): Promise<{ data: any[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.testAttempt.findMany({
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          student: { select: { email: true, fullName: true, phone: true } },
          test: { select: { title: true, pointsPerQuestion: true, questions: { select: { id: true } } } },
        },
      }),
      prisma.testAttempt.count(),
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

  static async calculateAnswerPoints(
    attemptId: string,
    pointsPerQuestion: number
  ): Promise<void> {
    // Get all answers for this attempt
    const answers = await prisma.answer.findMany({
      where: { attemptId },
      include: {
        question: {
          include: {
            options: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    // Update points for each answer
    await Promise.all(
      answers.map(async (answer) => {
        const correctOption = answer.question.options.find(
          (opt) => opt.isCorrect
        );
        const isCorrect =
          answer.optionId !== null && answer.optionId === correctOption?.id;
        const pointsEarned = isCorrect ? pointsPerQuestion : 0;

        return prisma.answer.update({
          where: { id: answer.id },
          data: { pointsEarned },
        });
      })
    );
  }
}
