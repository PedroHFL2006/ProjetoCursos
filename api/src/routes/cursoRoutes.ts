import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validarBody } from "../middlewares/validarBody";
import {
  createCursoSchema,
  updateCursoSchema,
} from "../modules/cursos/cursos.schemas";
import {
  createCursoController,
  deleteCursoController,
  getCursoByIdController,
  listCursosController,
  updateCursoController,
} from "../modules/cursos/cursos.controller";

const cursoRoutes = Router();

cursoRoutes.use(requireAuth);

cursoRoutes.get("/", listCursosController);
cursoRoutes.get("/:id", getCursoByIdController);
cursoRoutes.post("/", validarBody(createCursoSchema), createCursoController);
cursoRoutes.put("/:id", validarBody(updateCursoSchema), updateCursoController);
cursoRoutes.delete("/:id", deleteCursoController);

export { cursoRoutes };
