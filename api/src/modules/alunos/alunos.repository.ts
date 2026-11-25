import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.schemas";

const alunoSelect = {
  id: true,
  usuarioId: true,
  matricula: true,
  criadoEm: true,
  atualizadoEm: true,
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

  findById(id: string): Promise<AlunoRecord | null> {
    return prisma.aluno.findUnique({
      where: { id },
      select: alunoSelect,
    });
  },
  findByUsuarioId(usuarioId: string) {
    return prisma.aluno.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
  },
  findByMatricula(matricula: string) {
    return prisma.aluno.findUnique({
      where: { matricula },
      select: { id: true },
    });
  },
  create(data: CreateAlunoInput): Promise<AlunoRecord> {
    return prisma.aluno.create({
      data,
      select: alunoSelect,
    });
  },
  update(id: string, data: UpdateAlunoInput): Promise<AlunoRecord> {
    return prisma.aluno.update({
      where: { id },
      data,
      select: alunoSelect,
    });
  },
  delete(id: string): Promise<AlunoRecord> {
    return prisma.aluno.delete({
      where: { id },
      select: alunoSelect,
    });
  },
};
