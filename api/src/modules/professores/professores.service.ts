import { HttpError } from "../../errors/HttpError";
import {
  professoresRepository,
  type ProfessorRecord,
} from "./professores.repository";
import type {
  CreateProfessorInput,
  UpdateProfessorInput,
} from "./professores.schemas";

export const professoresService = {
  // Listar todos
  async list(): Promise<ProfessorRecord[]> {
    return professoresRepository.findAll();
  },

  // Buscar por ID com validação de 404
  async findById(id: string): Promise<ProfessorRecord> {
    const professor = await professoresRepository.findById(id);
    if (!professor) {
      throw new HttpError(404, "NOT_FOUND", "Professor não encontrado.");
    }
    return professor;
  },

  // Criar validando duplicidade de usuário
  async create(input: CreateProfessorInput): Promise<ProfessorRecord> {
    const existing = await professoresRepository.findByUsuarioId(
      input.usuarioId,
    );
    if (existing) {
      throw new HttpError(
        400,
        "DUPLICATE_RECORD",
        "Este usuário já possui perfil de professor.",
      );
    }
    return professoresRepository.create(input);
  },

  // Atualizar validando existência prévia
  async update(
    id: string,
    input: UpdateProfessorInput,
  ): Promise<ProfessorRecord> {
    await this.findById(id);
    return professoresRepository.update(id, input);
  },

  // Deletar validando existência prévia
  async delete(id: string): Promise<void> {
    await this.findById(id);
    await professoresRepository.delete(id);
  },
};
