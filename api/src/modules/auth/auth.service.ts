import * as bcrypt from "bcryptjs";

import { HttpError } from "../../errors/HttpError";
import { authRepository, type PublicUser } from "./auth.repository";
import type { RegisterInput } from "./auth.schemas";

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
};
