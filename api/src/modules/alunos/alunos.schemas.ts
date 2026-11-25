import { criarAlunoSchema } from "@projeto/shared";
import { z } from "zod";

export const createAlunoSchema = criarAlunoSchema;

export const updateAlunoSchema = criarAlunoSchema
  .pick({ matricula: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const alunoIdSchema = z.string().uuid("ID de aluno inválido.");

export type CreateAlunoInput = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>;
