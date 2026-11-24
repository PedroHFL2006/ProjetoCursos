import * as bcrypt from "bcryptjs";
import type { RoleUsuario } from "@projeto/shared";
import type { Prisma } from "@prisma/client";

import { HttpError } from "../../errors/HttpError";
import { usersRepository, type UserRecord } from "./users.repository";
import type { UpdateUserInput } from "./users.schemas";

const passwordSaltRounds = 12;

function assertCanManageUser(
  authenticatedUser: { id: string; role: RoleUsuario },
  targetUserId: string,
): void {
  if (
    authenticatedUser.role !== "ADMIN" &&
    authenticatedUser.id !== targetUserId
  ) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "Você não tem permissão para alterar este usuário.",
    );
  }
}

function assertCanViewUser(
  authenticatedUser: { id: string; role: RoleUsuario },
  targetUserId: string,
): void {
  if (
    authenticatedUser.role !== "ADMIN" &&
    authenticatedUser.id !== targetUserId
  ) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "Você não tem permissão para visualizar este usuário.",
    );
  }
}

export const usersService = {
  async list(
    authenticatedUser: { id: string; role: RoleUsuario },
  ): Promise<UserRecord[]> {
    if (authenticatedUser.role === "ADMIN") {
      return usersRepository.findAll();
    }

    const user = await usersRepository.findById(authenticatedUser.id);
    return user ? [user] : [];
  },

  async findById(
    id: string,
    authenticatedUser: { id: string; role: RoleUsuario },
  ): Promise<UserRecord> {
    assertCanViewUser(authenticatedUser, id);

    const user = await usersRepository.findById(id);
    if (!user) {
      throw new HttpError(404, "NOT_FOUND", "O usuário não foi encontrado.");
    }

    return user;
  },

  async update(
    id: string,
    authenticatedUser: { id: string; role: RoleUsuario },
    input: UpdateUserInput,
  ): Promise<UserRecord> {
    assertCanManageUser(authenticatedUser, id);

    if (input.email) {
      const existingUser = await usersRepository.findByEmail(input.email);
      if (existingUser && existingUser.id !== id) {
        throw new HttpError(
          400,
          "DUPLICATE_RECORD",
          "Este e-mail já está cadastrado.",
        );
      }
    }

    const data: Prisma.UsuarioUpdateInput = {};
    if (input.nome !== undefined) data.nome = input.nome;
    if (input.email !== undefined) data.email = input.email;
    if (input.senha !== undefined) {
      data.senha = await bcrypt.hash(input.senha, passwordSaltRounds);
    }

    return usersRepository.update(id, data);
  },

  async delete(
    id: string,
    authenticatedUser: { id: string; role: RoleUsuario },
  ): Promise<void> {
    assertCanManageUser(authenticatedUser, id);
    await usersRepository.delete(id);
  },
};
