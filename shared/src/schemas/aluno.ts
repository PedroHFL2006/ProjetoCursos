import { z } from "zod";

// Scheme do perfil de Aluno (vinculado a um Usuario)
export const alunoSchema = z.object({
  id: z.string().uuid(),
  usuarioId: z.string().uuid(),
  matricula: z.string().min(4, "A matricula deve ter no mínimo 4 caracteres"),
  criadoEm: z.date().or(z.string().datetime()),
  atualizadoEm: z.string().or(z.string().datetime()),
});

// Ao matricula/cadastrar o aluno, omitidos os campos controlados pelo sistema
export const criarAlunoSchema = alunoSchema.omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type Aluno = z.infer<typeof alunoSchema>;
export type CriarAlunoInput = z.infer<typeof criarAlunoSchema>;
