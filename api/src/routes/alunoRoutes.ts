import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validarBody } from "../middlewares/validarBody";
import {
  createAlunoSchema,
  updateAlunoSchema,
} from "../modules/alunos/alunos.schemas";
import {
  createAlunoController,
  deleteAlunoController,
  getAlunoByIdController,
  listAlunosController,
  updateAlunoController,
} from "../modules/alunos/alunos.controller";

const alunoRoutes = Router();

alunoRoutes.use(requireAuth);

alunoRoutes.get("/", listAlunosController);
alunoRoutes.get("/:id", getAlunoByIdController);
alunoRoutes.post("/", validarBody(createAlunoSchema), createAlunoController);
alunoRoutes.put("/:id", validarBody(updateAlunoSchema), updateAlunoController);
alunoRoutes.delete("/:id", deleteAlunoController);

export { alunoRoutes };
