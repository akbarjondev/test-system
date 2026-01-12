import express from "express";
import { TestsController } from "src/controllers/tests.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();
router.use(verifyTokenMiddleware);

// Create a test
router.post("/", TestsController.createTest);

// Get all tests (ADMIN: all tests, STUDENT: attempted tests)
router.get("/", TestsController.getAllTests);

// Get a single test by ID (anyone can view)
router.get("/:testId", TestsController.getTestById);

// Update a test (only creator or admin)
router.put("/:testId", TestsController.updateTest);

// Delete a test (only creator or admin)
router.delete("/:testId", TestsController.deleteTest);

export default router;
