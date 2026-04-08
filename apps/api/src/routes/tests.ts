import express from "express";
import { TestsController } from "src/controllers/tests.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";
import { validate } from "src/middlewares/validate";
import { createTestSchema, updateTestSchema } from "src/config/schemas";

const router = express.Router();
router.use(verifyTokenMiddleware);

router.post("/", validate(createTestSchema), TestsController.createTest);
router.get("/", TestsController.getAllTests);
router.get("/:testId", TestsController.getTestById);
router.put("/:testId", validate(updateTestSchema), TestsController.updateTest);
router.delete("/:testId", TestsController.deleteTest);

export default router;
