import { HttpError } from "../../errors/HttpError";
import { alunosRepository, type AlunoRecord } from "./alunos.repository";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.schemas";

export const alunosService = {
  async list(): Promise<AlunoRecord[]> {
    return alunosRepository.findAll();
  },

  async findById(id: string): Promise<AlunoRecord> {
    const aluno = await alunosRepository.findById(id);
    if (!aluno) {
      throw new HttpError(404, "NOT_FOUND", "Aluno não encontrado.");
    }
    return aluno;
  },

  async create(input: CreateAlunoInput): Promise<AlunoRecord> {
    const userHasAluno = await alunosRepository.findByUsuarioId(
      input.usuarioId,
    );
    if (userHasAluno) {
      throw new HttpError(
        400,
        "DUPLICATE_RECORD",
        "Este usuário já possui perfil de aluno.",
      );
    }

    const matriculaExists = await alunosRepository.findByMatricula(
      input.matricula,
    );
    if (matriculaExists) {
      throw new HttpError(
        400,
        "DUPLICATE_RECORD",
        "Esta matrícula já está em uso.",
      );
    }

    return alunosRepository.create(input);
  },

  async update(id: string, input: UpdateAlunoInput): Promise<AlunoRecord> {
    await this.findById(id);

    if (input.matricula) {
      const existing = await alunosRepository.findByMatricula(input.matricula);
      if (existing && existing.id !== id) {
        throw new HttpError(
          400,
          "DUPLICATE_RECORD",
          "Esta matrícula já pertence a outro aluno.",
        );
      }
    }

    return alunosRepository.update(id, input);
  },

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await alunosRepository.delete(id);
  },
};
