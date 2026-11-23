import { criarUsuarioSchema, usuarioSchema } from "@projeto/shared";
import { z } from "zod";

const updateBaseSchema = usuarioSchema
  .pick({ nome: true, email: true })
  .extend({
    senha: criarUsuarioSchema.shape.senha.min(
      8,
      "A senha deve ter no mínimo 8 caracteres",
    ),
  });

export const updateUserSchema = updateBaseSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
  });

export const userIdSchema = z.string().uuid("ID de usuário inválido.");

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
