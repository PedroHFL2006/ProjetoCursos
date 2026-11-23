import { Role, type Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
} satisfies Prisma.UsuarioSelect;

export type PublicUser = Prisma.UsuarioGetPayload<{
  select: typeof publicUserSelect;
}>;

export const authRepository = {
  findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
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
