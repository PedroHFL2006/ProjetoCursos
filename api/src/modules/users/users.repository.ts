import type { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma";

const userSelect = {
  id: true,
  nome: true,
  email: true,
  role: true,
  criadoEm: true,
  atualizadoEm: true,
} satisfies Prisma.UsuarioSelect;

export type UserRecord = Prisma.UsuarioGetPayload<{
  select: typeof userSelect;
}>;

export const usersRepository = {
  findAll(): Promise<UserRecord[]> {
    return prisma.usuario.findMany({
      select: userSelect,
      orderBy: { criadoEm: "desc" },
    });
  },

  findById(id: string): Promise<UserRecord | null> {
    return prisma.usuario.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  findByEmail(email: string) {
    return prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  update(id: string, data: Prisma.UsuarioUpdateInput): Promise<UserRecord> {
    return prisma.usuario.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  delete(id: string): Promise<UserRecord> {
    return prisma.usuario.delete({
      where: { id },
      select: userSelect,
    });
  },
};
