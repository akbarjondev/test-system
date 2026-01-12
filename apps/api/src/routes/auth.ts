import express from "express";
import { UsersController } from "src/controllers/users.controller";

const router = express.Router();

router.post("/login", UsersController.login);

router.post("/register", UsersController.registerUser);

export default router;
