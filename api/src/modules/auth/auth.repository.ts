import { Role, type Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
} satisfies Prisma.UsuarioSelect;

const loginUserSelect = {
  id: true,
  nome: true,
  email: true,
  senha: true,
  role: true,
} satisfies Prisma.UsuarioSelect;

export type PublicUser = Prisma.UsuarioGetPayload<{
  select: typeof publicUserSelect;
}>;

export type LoginUser = Prisma.UsuarioGetPayload<{
  select: typeof loginUserSelect;
}>;

export const authRepository = {
  findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  findForLogin(email: string): Promise<LoginUser | null> {
    return prisma.usuario.findUnique({
      where: { email },
      select: loginUserSelect,
    });
  },

  createUser(input: { nome: string; email: string; senha: string }) {
    return prisma.usuario.create({
      data: {
        ...input,
        role: Role.ALUNO,
      },
      select: publicUserSelect,
    });
  },
};
