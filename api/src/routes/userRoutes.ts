import { Router } from "express";

import { requireAuth } from "../middlewares/requireAuth";
import {
  deleteUserController,
  getUserController,
  listUsersController,
  updateUserController,
} from "../modules/users/users.controller";
import { updateUserSchema } from "../modules/users/users.schemas";
import { validarBody } from "../middlewares/validarBody";

const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/", listUsersController);
userRoutes.get("/:id", getUserController);
userRoutes.put("/:id", validarBody(updateUserSchema), updateUserController);
userRoutes.delete("/:id", deleteUserController);

export { userRoutes };
