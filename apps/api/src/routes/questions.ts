import express from "express";
import { QuestionsController } from "src/controllers/questions.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Create a question for a test
router.post("/tests/:testId/questions", QuestionsController.createQuestion);

// Get all questions for a test
router.get("/tests/:testId/questions", QuestionsController.getQuestionsByTest);

// Get a single question by ID
router.get("/questions/:questionId", QuestionsController.getQuestionById);

// Update a question
router.put("/questions/:questionId", QuestionsController.updateQuestion);

// Delete a question
router.delete("/questions/:questionId", QuestionsController.deleteQuestion);

export default router;
