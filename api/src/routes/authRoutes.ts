import { Router } from "express";

import {
  loginController,
  registerController,
} from "../modules/auth/auth.controller";
import { loginSchema, registerSchema } from "../modules/auth/auth.schemas";
import { validarBody } from "../middlewares/validarBody";

const authRoutes = Router();

authRoutes.post("/register", validarBody(registerSchema), registerController);
authRoutes.post("/login", validarBody(loginSchema), loginController);

export { authRoutes };
