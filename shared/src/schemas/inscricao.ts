import { z } from "zod";

// Ciclo de vida da matrícula do aluno em um curso
export const StatusInscricaoEnum = z.enum([
  "PENDENTE",
  "ATIVA",
  "CANCELADA",
  "CONCLUIDA",
]);
export type StatusInscricao = z.infer<typeof StatusInscricaoEnum>;

//Schema da relação <-> Curso
export const inscricaoSchema = z.object({
  id: z.string().uuid(),
  alunoId: z.string().uuid(),
  cursoId: z.string().uuid(),
  status: StatusInscricaoEnum.default("PENDENTE"),
  dataMatricula: z.date().or(z.string().datetime()),
  // Nullable pois o curso só é concluído futuramente
  concluidoEm: z.date().or(z.string().datetime()).nullable().optional(),
});

// Apenaas alunoId e cursoId são necessários ao solicitar a inscrição
export const criarInscricaoSchema = inscricaoSchema.omit({
  id: true,
  dataMatricula: true,
  concluidoEm: true,
});

export type Inscricao = z.infer<typeof inscricaoSchema>;
export type CriarInscricaoInput = z.infer<typeof criarInscricaoSchema>;
