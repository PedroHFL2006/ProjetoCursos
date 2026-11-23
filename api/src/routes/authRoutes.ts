import { Router } from "express";

import { registerController } from "../modules/auth/auth.controller";
import { registerSchema } from "../modules/auth/auth.schemas";
import { validarBody } from "../middlewares/validarBody";

const authRoutes = Router();

authRoutes.post("/register", validarBody(registerSchema), registerController);

export { authRoutes };
