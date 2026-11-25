import type { RequestHandler } from "express";
import { HttpError } from "../../errors/HttpError";
import { alunosService } from "./alunos.service";
import { alunoIdSchema } from "./alunos.schemas";

function parseAlunoId(value: unknown): string {
  const result = alunoIdSchema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "VALIDATION_ERROR", "ID de aluno inválido.");
  }

  return result.data;
}

// GET /alunos -> 200
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

// GET /alunos/:id -> 200 ou 404
export const getAlunoByIdController: RequestHandler = async (
  request,
  response,
) => {
  const id = parseAlunoId(request.params.id);
  const aluno = await alunosService.findById(id);
  return response.status(200).json({ aluno });
};

// POST /alunos -> 201
export const createAlunoController: RequestHandler = async (
  request,
  response,
) => {
  const aluno = await alunosService.create(request.body);
  return response.status(201).json({ aluno });
};

// PUT /alunos/:id -> 200
export const updateAlunoController: RequestHandler = async (
  request,
  response,
) => {
  const id = parseAlunoId(request.params.id);
  const aluno = await alunosService.update(id, request.body);
  return response.status(200).json({ aluno });
};

// DELETE /alunos/:id -> 204
export const deleteAlunoController: RequestHandler = async (
  request,
  response,
) => {
  const id = parseAlunoId(request.params.id);
  await alunosService.delete(id);
  return response.status(204).send();
};
