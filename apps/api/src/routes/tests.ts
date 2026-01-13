import express from "express";
import { TestsController } from "src/controllers/tests.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();
router.use(verifyTokenMiddleware);

router.post("/", TestsController.createTest);
router.get("/", TestsController.getAllTests);
router.get("/:testId", TestsController.getTestById);
router.put("/:testId", TestsController.updateTest);
router.delete("/:testId", TestsController.deleteTest);

export default router;
