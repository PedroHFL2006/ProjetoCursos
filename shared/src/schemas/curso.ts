import { z } from "zod";

// Schema que define a estrutura de um Curso
export const cursoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
  descricao: z.string().min(10, "A descriçao deve ter no mínimo 10 caracteres"),
  // Carga horário precisa ser um número inteiro e maior que zero
  cargaHoraria: z.number().int().positive("A carga horária deve ter positiva"),
  // Preço não pode ser negativo (aceita 0 para cursos gratuitos)
  preco: z.number().nonnegative("O preco não pode ser negativo"),
  // Quem minista o curso
  professorId: z.string().uuid(),
  // Status de visibilidade para os alunos
  publicado: z.boolean().default(false),
  criadoEm: z.date().or(z.string().datetime()),
  atualizadoEm: z.date().or(z.string().datetime()),
});

// Schema para criação de um novo curso
export const criarCursoSchema = cursoSchema.omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type Curso = z.infer<typeof cursoSchema>;
export type CriarCursoInput = z.infer<typeof criarCursoSchema>;
