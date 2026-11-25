import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type {
  CreateProfessorInput,
  UpdateProfessorInput,
} from "./professores.schemas";

// Seleciona os dados do professor incluindo nome e e-mail do usuário vinculado
const professorSelect = {
  id: true,
  usuarioId: true,
  especialidade: true,
  biografia: true,
  criadoEm: true,
  atualizadoEm: true,
  usuario: {
    select: {
      id: true,
      nome: true,
      email: true,
    },
  },
} satisfies Prisma.ProfessorSelect;

export type ProfessorRecord = Prisma.ProfessorGetPayload<{
  select: typeof professorSelect;
}>;

export const professoresRepository = {
  // Listar todos os professores
  findAll(): Promise<ProfessorRecord[]> {
    return prisma.professor.findMany({
      select: professorSelect,
      orderBy: { criadoEm: "desc" },
    });
  },

  // Buscar um professor por ID
  findById(id: string): Promise<ProfessorRecord | null> {
    return prisma.professor.findUnique({
      where: { id },
      select: professorSelect,
    });
  },

  // Buscar por usuarioId para evitar duplicidade
  findByUsuarioId(usuarioId: string) {
    return prisma.professor.findUnique({
      where: { usuarioId },
      select: { id: true },
    });
  },

  // Criar novo professor
  create(data: CreateProfessorInput): Promise<ProfessorRecord> {
    return prisma.professor.create({
      data,
      select: professorSelect,
    });
  },

  // Atualizar professor existente
  update(id: string, data: UpdateProfessorInput): Promise<ProfessorRecord> {
    return prisma.professor.update({
      where: { id },
      data,
      select: professorSelect,
    });
  },

  // Deletar professor
  delete(id: string): Promise<ProfessorRecord> {
    return prisma.professor.delete({
      where: { id },
      select: professorSelect,
    });
  },
};
