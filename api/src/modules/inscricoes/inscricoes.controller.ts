import type { RequestHandler } from "express";
import { inscricoesService } from "./inscricoes.service";

// GET /inscricoes -> 200
export const listInscricoesController: RequestHandler = async (_req, res) => {
  const inscricoes = await inscricoesService.list();
  return res.status(200).json({ inscricoes });
};

// GET /inscricoes/:id -> 200 ou 404
export const getInscricaoByIdController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const inscricao = await inscricoesService.findById(id);
  return res.status(200).json({ inscricao });
};

// POST /inscricoes -> 201
export const createInscricaoController: RequestHandler = async (req, res) => {
  const inscricao = await inscricoesService.create(req.body);
  return res.status(201).json({ inscricao });
};

// PUT /inscricoes/:id -> 200
export const updateInscricaoController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const inscricao = await inscricoesService.update(id, req.body);
  return res.status(200).json({ inscricao });
};

// DELETE /inscricoes/:id -> 204
export const deleteInscricaoController: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  await inscricoesService.delete(id);
  return res.status(204).send();
};
