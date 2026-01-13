import express from "express";
import { UsersController } from "src/controllers/users.controller";

const router = express.Router();

router.post("/register", UsersController.registerUser);
router.post("/login", UsersController.login);

export default router;
