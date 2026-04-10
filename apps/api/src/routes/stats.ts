import express from "express";
import { StatsController } from "src/controllers/stats.controller";
import { verifyAdminMiddleware, verifyTokenMiddleware } from "src/middlewares/auth";

const router = express.Router();

router.use(verifyTokenMiddleware);
router.use(verifyAdminMiddleware);

router.get("/", StatsController.getDashboardStats);

export default router;
