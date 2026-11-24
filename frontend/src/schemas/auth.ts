import { criarUsuarioSchema } from "@projeto/shared";
import { z } from "zod";

const registerBaseSchema = criarUsuarioSchema.omit({ role: true });

export const registerFormSchema = registerBaseSchema.extend({
  nome: registerBaseSchema.shape.nome
    .trim()
    .min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: registerBaseSchema.shape.email.trim().toLowerCase(),
  senha: registerBaseSchema.shape.senha.min(
    8,
    "A senha deve ter no mínimo 8 caracteres",
  ),
});

export const loginFormSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").toLowerCase(),
  senha: z.string().min(1, "Informe sua senha."),
});
