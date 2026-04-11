import { prisma } from "@test-system/database/lib/prisma";
import { UserRole } from "src/types/enums";

export interface DashboardStats {
  totalTests: number;
  totalStudents: number;
  totalAttempts: number;
  todayAttempts: number;
  activeTests: number;
  testsWithNoQuestions: number;
  incompleteAttempts: number;
  passRate: number | null;
  recentAttempts: {
    id: string;
    studentName: string | null;
    studentEmail: string | null;
    testTitle: string;
    score: number | null;
    passingScore: number | null;
    submittedAt: Date | null;
    timedOutAt: Date | null;
  }[];
}

export class StatsRepository {
  static async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalTests,
      totalStudents,
      totalAttempts,
      todayAttempts,
      incompleteAttempts,
      activeTests,
      testsWithQuestions,
      recentAttempts,
      attemptsWithThreshold,
    ] = await Promise.all([
      prisma.test.count(),

      prisma.user.count({ where: { role: UserRole.STUDENT } }),

      prisma.testAttempt.count(),

      prisma.testAttempt.count({
        where: { startedAt: { gte: startOfToday } },
      }),

      prisma.testAttempt.count({
        where: { submittedAt: null, timedOutAt: null },
      }),

      prisma.test.count({
        where: {
          OR: [
            { isAlwaysAvailable: true },
            {
              isAlwaysAvailable: false,
              availableFrom: { lte: now },
              availableUntil: { gte: now },
            },
          ],
        },
      }),

      prisma.test.count({
        where: { questions: { some: {} } },
      }),

      prisma.testAttempt.findMany({
        take: 10,
        where: {
          OR: [{ submittedAt: { not: null } }, { timedOutAt: { not: null } }],
        },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          score: true,
          submittedAt: true,
          timedOutAt: true,
          student: { select: { fullName: true, email: true } },
          test: { select: { title: true, passingScore: true } },
        },
      }),

      prisma.testAttempt.findMany({
        where: {
          OR: [{ submittedAt: { not: null } }, { timedOutAt: { not: null } }],
          test: { passingScore: { not: null } },
        },
        select: {
          score: true,
          test: { select: { passingScore: true } },
        },
      }),
    ]);

    const testsWithNoQuestions = totalTests - testsWithQuestions;

    const passedCount = attemptsWithThreshold.filter(
      (a) =>
        a.score !== null &&
        a.test.passingScore !== null &&
        a.score >= a.test.passingScore
    ).length;

    const passRate =
      attemptsWithThreshold.length > 0
        ? Math.round((passedCount / attemptsWithThreshold.length) * 100)
        : null;

    return {
      totalTests,
      totalStudents,
      totalAttempts,
      todayAttempts,
      activeTests,
      testsWithNoQuestions,
      incompleteAttempts,
      passRate,
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        studentName: a.student.fullName,
        studentEmail: a.student.email,
        testTitle: a.test.title,
        score: a.score,
        passingScore: a.test.passingScore,
        submittedAt: a.submittedAt,
        timedOutAt: a.timedOutAt,
      })),
    };
  }
}
