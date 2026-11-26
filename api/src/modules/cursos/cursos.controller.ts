import type { RequestHandler } from "express";
import { cursosService } from "./cursos.service";

// GET /cursos -> 200
export const listCursosController: RequestHandler = async (_req, res) => {
  const cursos = await cursosService.list();
  return res.status(200).json({ cursos });
};

// GET /cursos/:id -> 200 ou 404
export const getCursoByIdController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const curso = await cursosService.findById(id);
  return res.status(200).json({ curso });
};

// POST /cursos -> 201
export const createCursoController: RequestHandler = async (req, res) => {
  const curso = await cursosService.create(req.body);
  return res.status(201).json({ curso });
};

// PUT /cursos/:id -> 200
export const updateCursoController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const curso = await cursosService.update(id, req.body);
  return res.status(200).json({ curso });
};

// DELETE /cursos/:id -> 204
export const deleteCursoController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  await cursosService.delete(id);
  return res.status(204).send();
};
