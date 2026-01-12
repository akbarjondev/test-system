import express from "express";
import { AttemptsController } from "src/controllers/attempts.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Start a test attempt
router.post("/tests/:testId/attempts/start", AttemptsController.startTest);

// Get current active attempt for a test
router.get(
  "/tests/:testId/attempts/current",
  AttemptsController.getCurrentAttempt
);

// Submit an answer for a question
router.post(
  "/attempts/:attemptId/answers",
  AttemptsController.submitAnswer
);

// Submit the test attempt
router.post("/attempts/:attemptId/submit", AttemptsController.submitTest);

// Get attempt results (after submission)
router.get(
  "/attempts/:attemptId/results",
  AttemptsController.getAttemptResults
);

// Get all attempts for current student
router.get("/attempts/my-attempts", AttemptsController.getStudentAttempts);

// Get all attempts for a test (admin/creator only)
router.get("/tests/:testId/attempts", AttemptsController.getTestAttempts);

export default router;
