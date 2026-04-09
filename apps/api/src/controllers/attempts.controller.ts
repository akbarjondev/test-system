import { Request, Response } from "express";
import { AttemptsService } from "src/services/attempts.service";
import { UserRole } from "src/types/enums";

export interface SubmitAnswerRequest {
  questionId: string;
  optionId: string;
}

export class AttemptsController {
  /**
   * Get all attempts across all tests (admin only)
   * GET /api/attempts
   */
  static async getAllAttempts(req: Request, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const result = await AttemptsService.getAllAttempts({ page, limit });
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch attempts" });
    }
  }

  /**
   * Start a test attempt
   * POST /api/tests/:testId/attempts/start
   */
  static async startTest(
    req: Request<{ testId: string }>,
    res: Response
  ) {
    try {
      const { testId } = req.params;
      const studentId = req.user.id;

      // Validate user is student
      if (req.user.role !== UserRole.STUDENT) {
        return res.status(403).json({
          error: "Only students can start test attempts",
        });
      }

      const attempt = await AttemptsService.startTest(testId, studentId);

      // Calculate time remaining
      const timeRemaining = AttemptsService.calculateTimeRemaining(
        attempt,
        attempt.test!
      );

      // Format response - remove correct answers from options
      const formattedAttempt = {
        id: attempt.id,
        testId: attempt.testId,
        studentId: attempt.studentId,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        timeLimitMinutes: attempt.test?.timeLimitMinutes,
        timeRemaining: Math.floor(timeRemaining),
        questions: attempt.questionOrders?.map((qo) => ({
          questionId: qo.questionId,
          displayOrder: qo.displayOrder,
          text: qo.question.text,
          options: qo.question.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            order: opt.order,
            // isCorrect is NOT included for active attempts
          })),
        })),
      };

      return res.status(201).json(formattedAttempt);
    } catch (error: any) {
      if (error.message === "ATTEMPT_ALREADY_EXISTS") {
        return res.status(409).json({
          error: "Siz bu testni allaqachon topshirgansiz",
          code: "ATTEMPT_ALREADY_EXISTS",
        });
      }

      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      if (
        error.message.includes("not available") ||
        error.message.includes("no questions")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to start test attempt" });
    }
  }

  /**
   * Get current active attempt
   * GET /api/tests/:testId/attempts/current
   */
  static async getCurrentAttempt(
    req: Request<{ testId: string }>,
    res: Response
  ) {
    try {
      const { testId } = req.params;
      const studentId = req.user.id;

      const attempt = await AttemptsService.getCurrentAttempt(testId, studentId);

      // Calculate time remaining
      const timeRemaining = AttemptsService.calculateTimeRemaining(
        attempt,
        attempt.test!
      );

      // Format response - remove correct answers from options
      const formattedAttempt = {
        id: attempt.id,
        testId: attempt.testId,
        studentId: attempt.studentId,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        timeLimitMinutes: attempt.test?.timeLimitMinutes,
        timeRemaining: Math.floor(timeRemaining),
        questions: attempt.questionOrders?.map((qo) => ({
          questionId: qo.questionId,
          displayOrder: qo.displayOrder,
          text: qo.question.text,
          options: qo.question.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            order: opt.order,
            // isCorrect is NOT included for active attempts
          })),
        })),
        answers: attempt.answers?.map((ans) => ({
          questionId: ans.questionId,
          optionId: ans.optionId,
        })),
      };

      return res.json(formattedAttempt);
    } catch (error: any) {
      if (error.message === "No active attempt found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "TIME_LIMIT_EXCEEDED") {
        return res.status(400).json({
          error: "Time limit exceeded",
          message:
            "The time limit for this test has been exceeded. Please submit your test with your current answers.",
        });
      }

      return res.status(500).json({ error: "Failed to fetch attempt" });
    }
  }

  /**
   * Submit an answer for a question
   * POST /api/attempts/:attemptId/answers
   */
  static async submitAnswer(
    req: Request<{ attemptId: string }, any, SubmitAnswerRequest>,
    res: Response
  ) {
    try {
      const { attemptId } = req.params;
      const { questionId, optionId } = req.body;
      const studentId = req.user.id;

      if (!questionId || !optionId) {
        return res.status(400).json({
          error: "questionId and optionId are required",
        });
      }

      await AttemptsService.submitAnswer(
        attemptId,
        questionId,
        optionId,
        studentId
      );

      return res.status(200).json({ message: "Answer submitted successfully" });
    } catch (error: any) {
      if (error.message === "Attempt not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      if (error.message === "TIME_LIMIT_EXCEEDED") {
        return res.status(400).json({
          error: "Time limit exceeded",
          message:
            "The time limit for this test has been exceeded. Please submit your test with your current answers.",
        });
      }

      if (
        error.message.includes("already been submitted") ||
        error.message.includes("not found") ||
        error.message.includes("does not belong")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to submit answer" });
    }
  }

  /**
   * Submit the test attempt
   * POST /api/attempts/:attemptId/submit
   */
  static async submitTest(
    req: Request<{ attemptId: string }>,
    res: Response
  ) {
    try {
      const { attemptId } = req.params;
      const studentId = req.user.id;

      const result = await AttemptsService.submitTest(attemptId, studentId);
      const passed = result.passingScore != null ? result.totalScore >= result.passingScore : null;

      return res.json({
        id: result.id,
        testId: result.testId,
        studentId: result.studentId,
        startedAt: result.startedAt,
        submittedAt: result.submittedAt,
        score: result.totalScore,
        maxPossibleScore: result.maxPossibleScore,
        passed,
        message: "Test submitted successfully",
      });
    } catch (error: any) {
      if (error.message === "Attempt not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      if (error instanceof Error && error.message === "TIME_LIMIT_EXCEEDED") {
        return res.status(403).json({ error: "Vaqt tugadi", code: "TIME_LIMIT_EXCEEDED" });
      }

      if (
        error.message.includes("already been submitted") ||
        error.message.includes("not found")
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to submit test" });
    }
  }

  /**
   * Get attempt results (after submission)
   * GET /api/attempts/:attemptId/results
   */
  static async getAttemptResults(
    req: Request<{ attemptId: string }>,
    res: Response
  ) {
    try {
      const { attemptId } = req.params;
      const studentId = req.user.id;

      const result = await AttemptsService.getAttemptResults(
        attemptId,
        studentId
      );

      // Format response with correct answers
      const formattedResult = {
        id: result.id,
        testId: result.testId,
        studentId: result.studentId,
        startedAt: result.startedAt,
        submittedAt: result.submittedAt,
        score: result.totalScore,
        maxPossibleScore: result.maxPossibleScore,
        answers: result.answers?.map((ans) => {
          const questionOrder = result.questionOrders?.find(
            (qo) => qo.questionId === ans.questionId
          );
          const correctOption = questionOrder?.question.options.find(
            (opt) => opt.isCorrect
          );

          return {
            questionId: ans.questionId,
            questionText: questionOrder?.question.text,
            optionId: ans.optionId,
            pointsEarned: ans.pointsEarned,
            isCorrect: ans.optionId === correctOption?.id,
            correctOptionId: correctOption?.id,
          };
        }),
      };

      return res.json(formattedResult);
    } catch (error: any) {
      if (error.message === "Attempt not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      if (error.message.includes("not been submitted")) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to fetch results" });
    }
  }

  /**
   * Get all attempts for current student
   * GET /api/attempts/my-attempts
   */
  static async getStudentAttempts(req: Request, res: Response) {
    try {
      const studentId = req.user.id;

      const attempts = await AttemptsService.getStudentAttempts(studentId);

      return res.json(attempts);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch attempts" });
    }
  }

  /**
   * Get all attempts for a test (admin/creator only)
   * GET /api/tests/:testId/attempts
   */
  static async getTestAttempts(
    req: Request<{ testId: string }>,
    res: Response
  ) {
    try {
      const { testId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role as UserRole;

      const attempts = await AttemptsService.getTestAttempts(
        testId,
        userRole,
        userId
      );

      return res.json(attempts);
    } catch (error: any) {
      if (error.message === "Test not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to fetch attempts" });
    }
  }
}
