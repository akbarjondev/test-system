import express from "express";
import { TestsController } from "src/controllers/tests.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();
router.use(verifyTokenMiddleware);
router.post("/", TestsController.createTest);

export default router;
