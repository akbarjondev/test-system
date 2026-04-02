import express from "express";
import { QuestionsController } from "src/controllers/questions.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";
import { validate } from "src/middlewares/validate";
import { createQuestionSchema, updateQuestionSchema } from "src/config/schemas";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post("/tests/:testId/questions", validate(createQuestionSchema), QuestionsController.createQuestion);
router.get("/tests/:testId/questions", QuestionsController.getQuestionsByTest);
router.get("/questions/:questionId", QuestionsController.getQuestionById);
router.put("/questions/:questionId", validate(updateQuestionSchema), QuestionsController.updateQuestion);
router.delete("/questions/:questionId", QuestionsController.deleteQuestion);

export default router;
