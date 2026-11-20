import { z } from "zod";

// Schema do perfil de Professor (vinculado a um registro na tabela Usuario)
export const professorSchema = z.object({
  id: z.string().uuid(),
  // Chave estrangeita referenciando o id do Usuario correspondente
  usuarioId: z.string().uuid(),
  biografia: z
    .string()
    .max(500, "A biografia deve ter no máximo 500 caracteres")
    .optional(),
  especialidade: z.string().min(2, "A especialidade é obrigatória"),
  criadoEm: z.date().or(z.string().datetime()),
  atualizadoEm: z.date().or(z.string().datetime()),
});

// Payload para cadastrar um perfil de professor
export const criarProfessorSchema = professorSchema.omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type Proferssor = z.infer<typeof professorSchema>;
export type CriarProfessorInput = z.infer<typeof criarProfessorSchema>;
