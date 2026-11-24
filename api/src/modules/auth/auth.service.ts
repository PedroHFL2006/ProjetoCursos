import * as bcrypt from "bcryptjs";

import { createAuthToken } from "../../config/jwt";
import { HttpError } from "../../errors/HttpError";
import { authRepository, type PublicUser } from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const passwordSaltRounds = 12;

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existingUser = await authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new HttpError(
        400,
        "DUPLICATE_RECORD",
        "Este e-mail já está cadastrado.",
      );
    }

    const senha = await bcrypt.hash(input.senha, passwordSaltRounds);

    return authRepository.createUser({
      nome: input.nome,
      email: input.email,
      senha,
    });
  },

  async login(input: LoginInput): Promise<{
    token: string;
    user: PublicUser & { role: string };
  }> {
    const user = await authRepository.findForLogin(input.email);

    if (!user || !(await bcrypt.compare(input.senha, user.senha))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    }

    const { senha, ...publicUser } = user;
    const token = createAuthToken({ id: user.id, role: user.role });

    return { token, user: publicUser };
  },
};
