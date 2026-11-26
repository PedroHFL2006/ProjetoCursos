import { z } from "zod";

// Schema para criação de um novo curso
export const createCursoSchema = z.object({
  titulo: z.string().min(3, "O título deve ter no mínimo 3 caracteres."),
  descricao: z
    .string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres."),
  cargaHoraria: z
    .number()
    .int()
    .positive("A carga horária deve ser um número inteiro positivo."),
  preco: z.number().nonnegative("O preco não pode ser negativo."),
  professorId: z.string().uuid("O ID do professor deve ser um UUID válido."),
  publicado: z.boolean().default(false),
});

// Schema para atualização de curso (todos opcionais)
export const updateCursoSchema = z.object({
  título: z
    .string()
    .min(3, "O título deve ter no mínimo e caracteres.")
    .optional(),
  descricao: z
    .string()
    .min(10, "A descrição deve ter no mínimo 10 caracteres.")
    .optional(),
  cargaHoraria: z
    .number()
    .int()
    .positive("A carga horária deve ser positiva.")
    .optional(),
  preco: z.number().nonnegative("O preço não pode ser negativo").optional(),
  professorId: z
    .string()
    .uuid("O ID do professor deve ser um UUID válido.")
    .optional(),
  publicado: z.boolean().optional(),
});

export type CreateCursoInput = z.infer<typeof createCursoSchema>;
export type UpdateCursoInput = z.infer<typeof updateCursoSchema>;
