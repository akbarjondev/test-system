import express from "express";
import { QuestionsController } from "src/controllers/questions.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post("/tests/:testId/questions", QuestionsController.createQuestion);
router.get("/tests/:testId/questions", QuestionsController.getQuestionsByTest);
router.get("/questions/:questionId", QuestionsController.getQuestionById);
router.put("/questions/:questionId", QuestionsController.updateQuestion);
router.delete("/questions/:questionId", QuestionsController.deleteQuestion);

export default router;
