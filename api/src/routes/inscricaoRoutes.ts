import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { validarBody } from "../middlewares/validarBody";
import {
  createInscricaoSchema,
  updateInscricaoSchema,
} from "../modules/inscricoes/inscricoes.schemas";
import {
  createInscricaoController,
  deleteInscricaoController,
  getInscricaoByIdController,
  listInscricoesController,
  updateInscricaoController,
} from "../modules/inscricoes/inscricoes.controller";

const inscricaoRoutes = Router();

inscricaoRoutes.use(requireAuth);

inscricaoRoutes.get("/", listInscricoesController);
inscricaoRoutes.get("/:id", getInscricaoByIdController);
inscricaoRoutes.post(
  "/",
  validarBody(createInscricaoSchema),
  createInscricaoController,
);
inscricaoRoutes.put(
  "/:id",
  validarBody(updateInscricaoSchema),
  updateInscricaoController,
);
inscricaoRoutes.delete("/:id", deleteInscricaoController);

export { inscricaoRoutes };
