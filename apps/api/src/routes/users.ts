import express from "express";
import { UsersController } from "src/controllers/users.controller";
import { verifyAdminMiddleware, verifyTokenMiddleware } from "src/middlewares/auth";
import { validate } from "src/middlewares/validate";
import { updateUserRoleSchema } from "src/config/schemas";

const router = express.Router();
router.use(verifyTokenMiddleware);
router.use(verifyAdminMiddleware);

router.get("/", UsersController.getAllUsers);
router.put("/:userId", validate(updateUserRoleSchema), UsersController.updateUserRole);

export default router;
