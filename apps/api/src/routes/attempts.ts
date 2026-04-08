import express from "express";
import { AttemptsController } from "src/controllers/attempts.controller";
import { verifyTokenMiddleware, verifyAdminMiddleware } from "src/middlewares/auth";
import { validate } from "src/middlewares/validate";
import { submitAnswerSchema } from "src/config/schemas";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.get("/attempts", verifyAdminMiddleware, AttemptsController.getAllAttempts);
router.post("/tests/:testId/attempts/start", AttemptsController.startTest);
router.get(
  "/tests/:testId/attempts/current",
  AttemptsController.getCurrentAttempt
);
router.post(
  "/attempts/:attemptId/answers",
  validate(submitAnswerSchema),
  AttemptsController.submitAnswer
);
router.post("/attempts/:attemptId/submit", AttemptsController.submitTest);
router.get(
  "/attempts/:attemptId/results",
  AttemptsController.getAttemptResults
);
router.get("/attempts/my-attempts", AttemptsController.getStudentAttempts);
router.get("/tests/:testId/attempts", AttemptsController.getTestAttempts);

export default router;
