import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validarBody } from "../middlewares/validarBody";
import {
  createProfessorSchema,
  updateProfessorSchema,
} from "../modules/professores/professores.schemas";
import {
  createProfessorController,
  deleteProfessorController,
  getProfessorByIdController,
  listProfessoresController,
  updateProfessorController,
} from "../modules/professores/professores.controller";

const professorRoutes = Router();

// Todas as rotas de professores exigem login
professorRoutes.use(requireAuth);

professorRoutes.get("/", listProfessoresController);
professorRoutes.get("/:id", getProfessorByIdController);
professorRoutes.post(
  "/",
  validarBody(createProfessorSchema),
  createProfessorController,
);
professorRoutes.put(
  "/:id",
  validarBody(updateProfessorSchema),
  updateProfessorController,
);
professorRoutes.delete("/:id", deleteProfessorController);

export { professorRoutes };
