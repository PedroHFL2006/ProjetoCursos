import { z } from "zod";

// Schema para criação de um novo perfil de professor
export const createProfessorSchema = z.object({
  usuarioId: z.string().uuid("O ID do usuário deve ser um UUID válido."),
  especialidade: z
    .string()
    .min(2, "A especialidade deve ter no mínimo 2 caracteres."),
  biografia: z
    .string()
    .max(500, "A biografia pode ter no máximo 500 caracteres.")
    .optional(),
});

// Schema para atualização de professor (todos os campos opcionais)
export const updateProfessorSchema = z.object({
  especialidade: z
    .string()
    .min(2, "A especialidade deve ter no minimo 2 caracteres.")
    .optional(),
  biografia: z
    .string()
    .max(500, "A biografia pode ter no máximo 500 caracteres.")
    .nullable()
    .optional(),
});

export type CreateProfessorInput = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorInput = z.infer<typeof updateProfessorSchema>;
