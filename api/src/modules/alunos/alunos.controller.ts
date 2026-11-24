import type { RequestHandler } from "express";

import { HttpError } from "../../errors/HttpError";
import { alunosService } from "./alunos.service";

export const listAlunosController: RequestHandler = async (
  request,
  response,
) => {
  if (!request.authenticatedUser) {
    throw new HttpError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  const alunos = await alunosService.list(request.authenticatedUser);
  return response.status(200).json({ alunos });
};
