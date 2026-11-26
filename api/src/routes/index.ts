import { Router } from "express";

import { alunoRoutes } from "./alunoRoutes";
import { authRoutes } from "./authRoutes";
import { cursoRoutes } from "./cursoRoutes";
import { inscricaoRoutes } from "./inscricaoRoutes";
import { professorRoutes } from "./professorRoutes";
import { userRoutes } from "./userRoutes";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/alunos", alunoRoutes);
routes.use("/professores", professorRoutes);
routes.use("/cursos", cursoRoutes);
routes.use("/inscricoes", inscricaoRoutes);
routes.use("/usuarios", userRoutes);

routes.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API funcionando",
  });
});

export { routes };
