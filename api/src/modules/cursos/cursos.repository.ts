import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateCursoInput, UpdateCursoInput } from "./cursos.schemas";

// Include relacional do Professor responsável e seus dados cadastrais
const cursoInclude = {
  professor: {
    select: {
      id: true,
      especialidade: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
} satisfies Prisma.CursoInclude;

export type CursoRecord = Prisma.CursoGetPayload<{
  include: typeof cursoInclude;
}>;

export const cursosRepository = {
  findAll(): Promise<CursoRecord[]> {
    return prisma.curso.findMany({
      include: cursoInclude,
      orderBy: { criadoEm: "desc" },
    });
  },

  findById(id: string): Promise<CursoRecord | null> {
    return prisma.curso.findUnique({
      where: { id },
      include: cursoInclude,
    });
  },

  create(data: CreateCursoInput): Promise<CursoRecord> {
    return prisma.curso.create({
      data,
      include: cursoInclude,
    });
  },

  update(id: string, data: UpdateCursoInput): Promise<CursoRecord> {
    return prisma.curso.update({
      where: { id },
      data,
      include: cursoInclude,
    });
  },

  delete(id: string): Promise<CursoRecord> {
    return prisma.curso.delete({
      where: { id },
      include: cursoInclude,
    });
  },
};
