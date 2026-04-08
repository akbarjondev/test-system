import express from "express";
import { UsersController } from "src/controllers/users.controller";
import { validate } from "src/middlewares/validate";
import { loginSchema, registerSchema } from "src/config/schemas";

const router = express.Router();

router.post("/register", validate(registerSchema), UsersController.registerUser);
router.post("/login", validate(loginSchema), UsersController.login);

export default router;
