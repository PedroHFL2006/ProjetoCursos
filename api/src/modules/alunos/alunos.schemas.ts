import { z } from "zod";

// Schema para criação de aluno
export const createAlunoSchema = z.object({
  usuarioId: z.string().uuid("O ID do usuário deve ser um UUID válido."),
  matricula: z.string().min(4, "A matrícula deve ter no mínimo 4 caracteres."),
});

// Schema para atualização de aluno
export const updateAlunoSchema = z.object({
  matricula: z
    .string()
    .min(4, "A matrícula deve ter no mínimo 4 caracteres.")
    .optional(),
});

export type CreateAlunoInput = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>;
