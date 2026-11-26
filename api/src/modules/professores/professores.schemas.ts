import { criarProfessorSchema } from "@projeto/shared";
import { z } from "zod";

export const createProfessorSchema = criarProfessorSchema;

export const updateProfessorSchema = criarProfessorSchema
  .extend({
    biografia: z
      .string()
      .max(500, "A biografia pode ter no máximo 500 caracteres.")
      .nullable()
      .optional(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const professorIdSchema = z.string().uuid("ID de professor inválido.");

export type CreateProfessorInput = z.infer<typeof createProfessorSchema>;
export type UpdateProfessorInput = z.infer<typeof updateProfessorSchema>;
