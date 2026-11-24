import type { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

const alunoSelect = {
  id: true,
  matricula: true,
  usuario: {
    select: {
      id: true,
      nome: true,
      email: true,
    },
  },
} satisfies Prisma.AlunoSelect;

export type AlunoRecord = Prisma.AlunoGetPayload<{
  select: typeof alunoSelect;
}>;

export const alunosRepository = {
  findAll(): Promise<AlunoRecord[]> {
    return prisma.aluno.findMany({
      select: alunoSelect,
      orderBy: { usuario: { nome: "asc" } },
    });
  },

  findForProfessor(usuarioId: string): Promise<AlunoRecord[]> {
    return prisma.aluno.findMany({
      where: {
        inscricoes: {
          some: {
            curso: {
              is: {
                professor: {
                  is: { usuarioId },
                },
              },
            },
          },
        },
      },
      select: alunoSelect,
      orderBy: { usuario: { nome: "asc" } },
    });
  },
};
