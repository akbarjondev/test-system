import {
  TestAttempt,
  Question,
  Option,
} from "@test-system/database/prisma/generated/client";
import {
  AttemptsRepository,
  AttemptWithRelations,
} from "src/repositories/attempts.repository";
import { TestsRepository } from "src/repositories/tests.repository";
import { QuestionsRepository } from "src/repositories/questions.repository";
import { UserRole } from "src/types/enums";

export class AttemptsService {
  /**
   * Start a test attempt - creates attempt, shuffles questions, creates empty answers
   */
  static async startTest(
    testId: string,
    studentId: string
  ): Promise<AttemptWithRelations> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Validate test has questions
    const questions = await QuestionsRepository.getQuestionsByTestId(testId);
    if (questions.length === 0) {
      throw new Error("Test has no questions");
    }

    // Check test availability
    this.validateTestAvailability(test);

    // Check if there's already an active attempt (allow multiple if test is open)
    // For MVP, we'll allow multiple attempts - can be restricted later if needed
    // const activeAttempt = await AttemptsRepository.getActiveAttemptByTestAndStudent(testId, studentId);
    // if (activeAttempt) {
    //   throw new Error("You already have an active attempt for this test");
    // }

    // Shuffle questions using Fisher-Yates algorithm
    const shuffledQuestionIds = this.shuffleArray(questions.map((q) => q.id));

    // Create attempt with shuffled questions
    const attempt = await AttemptsRepository.createAttempt({
      testId,
      studentId,
      questionIds: shuffledQuestionIds,
    });

    // Get full attempt with relations
    const fullAttempt = await AttemptsRepository.getAttemptById(
      attempt.id,
      true
    );

    if (!fullAttempt) {
      throw new Error("Failed to create attempt");
    }

    return fullAttempt;
  }

  /**
   * Get current active attempt for a test
   */
  static async getCurrentAttempt(
    testId: string,
    studentId: string
  ): Promise<AttemptWithRelations> {
    const attempt = await AttemptsRepository.getActiveAttemptByTestAndStudent(
      testId,
      studentId
    );

    if (!attempt) {
      throw new Error("No active attempt found for this test");
    }

    // Validate time limit
    const test = await TestsRepository.getOneTest(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    if (this.isTimeLimitExceeded(attempt, test)) {
      throw new Error("TIME_LIMIT_EXCEEDED");
    }

    return attempt;
  }

  /**
   * Submit an answer for a question
   */
  static async submitAnswer(
    attemptId: string,
    questionId: string,
    optionId: string,
    studentId: string
  ): Promise<void> {
    // Validate attempt exists and belongs to student
    const attempt = await AttemptsRepository.getAttemptById(attemptId, true);
    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.studentId !== studentId) {
      throw new Error("Unauthorized: This attempt does not belong to you");
    }

    if (attempt.submittedAt) {
      throw new Error("Attempt has already been submitted");
    }

    // Validate time limit
    const test = await TestsRepository.getOneTest(attempt.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    if (this.isTimeLimitExceeded(attempt, test)) {
      throw new Error("TIME_LIMIT_EXCEEDED");
    }

    // Validate question exists in attempt
    const questionOrder = attempt.questionOrders?.find(
      (qo) => qo.questionId === questionId
    );
    if (!questionOrder) {
      throw new Error("Question not found in this attempt");
    }

    // Validate option belongs to question
    const question = questionOrder.question;
    const option = question.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error("Option does not belong to this question");
    }

    // Update answer
    await AttemptsRepository.updateAnswer(attemptId, questionId, optionId);
  }

  /**
   * Submit the test attempt and calculate score
   */
  static async submitTest(
    attemptId: string,
    studentId: string
  ): Promise<TestAttempt & { totalScore: number; maxPossibleScore: number }> {
    // Validate attempt exists and belongs to student
    const attempt = await AttemptsRepository.getAttemptById(attemptId, true);
    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.studentId !== studentId) {
      throw new Error("Unauthorized: This attempt does not belong to you");
    }

    if (attempt.submittedAt) {
      throw new Error("Attempt has already been submitted");
    }

    // Get test to calculate score
    const test = await TestsRepository.getOneTest(attempt.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Calculate points per question (default to 1 if not set)
    const pointsPerQuestion = test.pointsPerQuestion ?? 1;

    // Calculate score for all answers
    await AttemptsRepository.calculateAnswerPoints(
      attemptId,
      pointsPerQuestion
    );

    // Get all answers with calculated points
    const updatedAttempt = await AttemptsRepository.getAttemptById(
      attemptId,
      true
    );
    if (!updatedAttempt || !updatedAttempt.answers) {
      throw new Error("Failed to calculate score");
    }

    // Sum all points earned
    const totalScore = updatedAttempt.answers.reduce(
      (sum, answer) => sum + answer.pointsEarned,
      0
    );

    // Calculate max possible score
    const totalQuestions = updatedAttempt.questionOrders?.length ?? 0;
    const maxPossibleScore = totalQuestions * pointsPerQuestion;

    // Submit attempt with calculated score
    const submittedAttempt = await AttemptsRepository.submitAttempt(
      attemptId,
      totalScore
    );

    return {
      ...submittedAttempt,
      totalScore,
      maxPossibleScore,
    };
  }

  /**
   * Get attempt results (after submission)
   */
  static async getAttemptResults(
    attemptId: string,
    studentId: string
  ): Promise<
    AttemptWithRelations & { totalScore: number; maxPossibleScore: number }
  > {
    const attempt = await AttemptsRepository.getAttemptById(attemptId, true);

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.studentId !== studentId) {
      throw new Error("Unauthorized: This attempt does not belong to you");
    }

    if (!attempt.submittedAt) {
      throw new Error("Attempt has not been submitted yet");
    }

    // Get test for max score calculation
    const test = await TestsRepository.getOneTest(attempt.testId);
    if (!test) {
      throw new Error("Test not found");
    }

    const pointsPerQuestion = test.pointsPerQuestion ?? 1;
    const totalQuestions = attempt.questionOrders?.length ?? 0;
    const maxPossibleScore = totalQuestions * pointsPerQuestion;

    return {
      ...attempt,
      totalScore: attempt.score ?? 0,
      maxPossibleScore,
    };
  }

  /**
   * Get all attempts for a student
   */
  static async getStudentAttempts(studentId: string): Promise<TestAttempt[]> {
    return await AttemptsRepository.getAttemptsByStudent(studentId);
  }

  /**
   * Get all attempts for a test (admin/creator only)
   */
  static async getTestAttempts(
    testId: string,
    userRole: UserRole,
    userId: string
  ): Promise<TestAttempt[]> {
    // Validate test exists
    const test = await TestsRepository.getOneTest(testId);
    if (!test) {
      throw new Error("Test not found");
    }

    // Only admin or test creator can view attempts
    if (userRole !== UserRole.ADMIN && test.createdById !== userId) {
      throw new Error(
        "Unauthorized: Only test creator or admin can view attempts"
      );
    }

    return await AttemptsRepository.getAttemptsByTest(testId);
  }

  /**
   * Validate test availability
   */
  private static validateTestAvailability(test: any): void {
    if (test.isAlwaysAvailable) {
      return; // Test is always available
    }

    const now = new Date();
    const availableFrom = test.availableFrom
      ? new Date(test.availableFrom)
      : null;
    const availableUntil = test.availableUntil
      ? new Date(test.availableUntil)
      : null;

    if (availableFrom && now < availableFrom) {
      throw new Error(
        `Test is not available yet. It will be available from ${availableFrom.toISOString()}`
      );
    }

    if (availableUntil && now > availableUntil) {
      throw new Error(
        `Test is no longer available. It was available until ${availableUntil.toISOString()}`
      );
    }
  }

  /**
   * Check if time limit has been exceeded
   */
  private static isTimeLimitExceeded(attempt: TestAttempt, test: any): boolean {
    const elapsedMinutes =
      (Date.now() - new Date(attempt.startedAt).getTime()) / (1000 * 60);
    return elapsedMinutes > test.timeLimitMinutes;
  }

  /**
   * Calculate time remaining in seconds
   */
  static calculateTimeRemaining(attempt: TestAttempt, test: any): number {
    const elapsedSeconds =
      (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
    const totalSeconds = test.timeLimitMinutes * 60;
    return Math.max(0, totalSeconds - elapsedSeconds);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i] as T, shuffled[j] as T] = [
        shuffled[j] as T,
        shuffled[i] as T,
      ];
    }
    return shuffled;
  }
}
