import { HttpError } from "../../errors/HttpError";
import {
  inscricoesRepository,
  type InscricaoRecord,
} from "./inscricoes.repository";
import type {
  CreateInscricaoInput,
  UpdateInscricaoInput,
} from "./inscricoes.schemas";
import { prisma } from "../../config/prisma";

export const inscricoesService = {
  async list(): Promise<InscricaoRecord[]> {
    return inscricoesRepository.findAll();
  },

  async findById(id: string): Promise<InscricaoRecord> {
    const inscricao = await inscricoesRepository.findById(id);
    if (!inscricao) {
      throw new HttpError(404, "NOT_FOUND", "Inscrição não encontrada.");
    }
    return inscricao;
  },

  async create(input: CreateInscricaoInput): Promise<InscricaoRecord> {
    // 1. Valida se o aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: input.alunoId },
    });
    if (!aluno) {
      throw new HttpError(404, "NOT_FOUND", "O aluno informado não existe.");
    }

    // 2. Valida se o curso existe
    const curso = await prisma.curso.findUnique({
      where: { id: input.cursoId },
    });
    if (!curso) {
      throw new HttpError(404, "NOT_FOUND", "O curso informado não existe.");
    }

    // 3. Valida a regra de unicidade (Aluno + Curso)
    const alreadySubscribed = await inscricoesRepository.findByAlunoECurso(
      input.alunoId,
      input.cursoId,
    );
    if (alreadySubscribed) {
      throw new HttpError(
        400,
        "DUPLICATE_RECORD",
        "Este aluno já está inscrito neste curso.",
      );
    }

    return inscricoesRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateInscricaoInput,
  ): Promise<InscricaoRecord> {
    await this.findById(id);
    return inscricoesRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await inscricoesRepository.delete(id);
  },
};
