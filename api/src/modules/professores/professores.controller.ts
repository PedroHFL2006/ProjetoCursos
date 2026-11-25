import type { RequestHandler } from "express";
import { HttpError } from "../../errors/HttpError";
import { professoresService } from "./professores.service";
import { professorIdSchema } from "./professores.schemas";

function parseProfessorId(value: unknown): string {
  const result = professorIdSchema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "VALIDATION_ERROR", "ID de professor inválido.");
  }

  return result.data;
}

// GET /professores -> 200
export const listProfessoresController: RequestHandler = async (_req, res) => {
  const professores = await professoresService.list();
  return res.status(200).json({ professores });
};

// GET /professores/:id -> 200 ou 404
export const getProfessorByIdController: RequestHandler = async (req, res) => {
  const id = parseProfessorId(req.params.id);
  const professor = await professoresService.findById(id);
  return res.status(200).json({ professor });
};

// POST /professores -> 201
export const createProfessorController: RequestHandler = async (req, res) => {
  const professor = await professoresService.create(req.body);
  return res.status(201).json({ professor });
};

// PUT /professores/:id -> 200
export const updateProfessorController: RequestHandler = async (req, res) => {
  const id = parseProfessorId(req.params.id);
  const professor = await professoresService.update(id, req.body);
  return res.status(200).json({ professor });
};

// DELETE /professores/:id -> 204
export const deleteProfessorController: RequestHandler = async (req, res) => {
  const id = parseProfessorId(req.params.id);
  await professoresService.delete(id);
  return res.status(204).send();
};
