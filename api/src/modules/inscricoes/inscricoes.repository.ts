import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import type {
  CreateInscricaoInput,
  UpdateInscricaoInput,
} from "./inscricoes.schemas";

// Include relacional de Aluno (com dados do Usuário) e do Curso
const inscricaoInclude = {
  aluno: {
    select: {
      id: true,
      matricula: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  },
  curso: {
    select: {
      id: true,
      titulo: true,
      cargaHoraria: true,
      preco: true,
    },
  },
} satisfies Prisma.InscricaoInclude;

export type InscricaoRecord = Prisma.InscricaoGetPayload<{
  include: typeof inscricaoInclude;
}>;

export const inscricoesRepository = {
  findAll(): Promise<InscricaoRecord[]> {
    return prisma.inscricao.findMany({
      include: inscricaoInclude,
      orderBy: { dataMatricula: "desc" },
    });
  },

  findById(id: string): Promise<InscricaoRecord | null> {
    return prisma.inscricao.findUnique({
      where: { id },
      include: inscricaoInclude,
    });
  },

  // Busca para validar a chave única [alunoId, cursoId]
  findByAlunoECurso(alunoId: string, cursoId: string) {
    return prisma.inscricao.findUnique({
      where: {
        alunoId_cursoId: {
          alunoId,
          cursoId,
        },
      },
    });
  },

  create(data: CreateInscricaoInput): Promise<InscricaoRecord> {
    return prisma.inscricao.create({
      data,
      include: inscricaoInclude,
    });
  },

  update(id: string, data: UpdateInscricaoInput): Promise<InscricaoRecord> {
    return prisma.inscricao.update({
      where: { id },
      data: {
        ...data,
        concluidoEm:
          typeof data.concluidoEm === "string"
            ? new Date(data.concluidoEm)
            : data.concluidoEm,
=======
        concluidoEm: data.concluidoEm
          ? new Date(data.concluidoEm)
          : data.concluidoEm,
>>>>>>> a0862964d20fa57c39aeba8d1bb4ce3c40069973
      },
      include: inscricaoInclude,
    });
  },

  delete(id: string): Promise<InscricaoRecord> {
    return prisma.inscricao.delete({
      where: { id },
      include: inscricaoInclude,
    });
  },
};
