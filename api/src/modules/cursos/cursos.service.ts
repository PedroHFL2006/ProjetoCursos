import { HttpError } from "../../errors/HttpError";
import { cursosRepository, type CursoRecord } from "./cursos.repository";
import type { CreateCursoInput, UpdateCursoInput } from "./cursos.schemas";
import { prisma } from "../../config/prisma";

export const cursosService = {
  async list(): Promise<CursoRecord[]> {
    return cursosRepository.findAll();
  },

  async findById(id: string): Promise<CursoRecord> {
    const curso = await cursosRepository.findById(id);
    if (!curso) {
      throw new HttpError(404, "NOT_FOUND", "Curso não encontrado.");
    }
    return curso;
  },

  async create(input: CreateCursoInput): Promise<CursoRecord> {
    // Valida se o professor existe
    const professorExists = await prisma.professor.findUnique({
      where: { id: input.professorId },
    });

    if (!professorExists) {
      throw new HttpError(
        404,
        "NOT_FOUND",
        "O professor informado não existe.",
      );
    }

    return cursosRepository.create(input);
  },

  async update(id: string, input: UpdateCursoInput): Promise<CursoRecord> {
    await this.findById(id);

    if (input.professorId) {
      const professorExists = await prisma.professor.findUnique({
        where: { id: input.professorId },
      });
      if (!professorExists) {
        throw new HttpError(
          404,
          "NOT_FOUND",
          "O professor informado não existe.",
        );
      }
    }

    return cursosRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await cursosRepository.delete(id);
  },
};
