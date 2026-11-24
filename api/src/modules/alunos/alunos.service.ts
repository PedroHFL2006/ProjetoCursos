import type { AuthenticatedUser } from "../../config/jwt";
import { HttpError } from "../../errors/HttpError";
import { alunosRepository } from "./alunos.repository";

export const alunosService = {
  list(authenticatedUser: AuthenticatedUser) {
    if (authenticatedUser.role === "ADMIN") {
      return alunosRepository.findAll();
    }

    if (authenticatedUser.role === "PROFESSOR") {
      return alunosRepository.findForProfessor(authenticatedUser.id);
    }

    throw new HttpError(
      403,
      "FORBIDDEN",
      "Você não tem permissão para visualizar a lista de alunos.",
    );
  },
};
