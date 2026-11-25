import type { RequestHandler } from "express";
import { professoresService } from "./professores.service";

// GET /professores -> 200
export const listProfessoresController: RequestHandler = async (_req, res) => {
  const professores = await professoresService.list();
  return res.status(200).json({ professores });
};

// GET /professores/:id -> 200 ou 404
export const getProfessorByIdController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
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
  const id = String(req.params.id);
  const professor = await professoresService.update(id, req.body);
  return res.status(200).json({ professor });
};

// DELETE /professores/:id -> 204
export const deleteProfessorController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  await professoresService.delete(id);
  return res.status(204).send();
};
