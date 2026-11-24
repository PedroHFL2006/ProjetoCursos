import { Router } from "express";

import { requireAuth } from "../middlewares/requireAuth";
import { listAlunosController } from "../modules/alunos/alunos.controller";

const alunoRoutes = Router();

alunoRoutes.use(requireAuth);
alunoRoutes.get("/", listAlunosController);

export { alunoRoutes };
