import { z } from "zod";

// Enum que define os papéis de acesso no sistema (RBCA simples)
export const RoleUsuarioEnum = z.enum(["ADMIN", "PROFESSOR", "ALUNO"]);
export type RoleUsuario = z.infer<typeof RoleUsuarioEnum>;

// Schema que representa a entidade Usuario completa como ela vem do banco de dados
export const usuarioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  role: RoleUsuarioEnum,
  // Aceita tanto objeto Date nativo quando string no formaro ISO (útil porque JSON não trafega Date nativo)
  criadoEm: z.date().or(z.string().datetime()),
  atualizadoEm: z.date().or(z.string().datetime()),
});

// Schema de validação para criação de usuário:
// Removemos id e timestamps (gerados pelo banco) e exigimos a senha
export const criarUsuarioSchema = usuarioSchema
  .omit({
    id: true,
    criadoEm: true,
    atualizadoEm: true,
  })
  .extend({
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  });

// Extração automático dos tipos TypeScript a partir dos schemas Zod (evita duplicar tipagem)
export type Usuario = z.infer<typeof usuarioSchema>;
export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
