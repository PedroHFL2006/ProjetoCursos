import { criarUsuarioSchema } from "@projeto/shared";

const registerBaseSchema = criarUsuarioSchema.omit({ role: true });

export const registerSchema = registerBaseSchema
  .extend({
    nome: registerBaseSchema.shape.nome
      .trim()
      .min(2, "O nome deve ter no mínimo 2 caracteres"),
    email: registerBaseSchema.shape.email.trim().toLowerCase(),
    senha: registerBaseSchema.shape.senha.min(
      8,
      "A senha deve ter no mínimo 8 caracteres",
    ),
  })
  .strict();

export type RegisterInput = typeof registerSchema._output;
