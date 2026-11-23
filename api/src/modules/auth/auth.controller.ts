import type { RequestHandler } from "express";

import { authService } from "./auth.service";
import type { PublicUser } from "./auth.repository";
import type { RegisterInput } from "./auth.schemas";

interface RegisterResponse {
  message: string;
  user: PublicUser;
}

export const registerController: RequestHandler<
  Record<string, string>,
  RegisterResponse,
  RegisterInput
> = async (request, response, next) => {
  try {
    const user = await authService.register(request.body);

    return response.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user,
    });
  } catch (error) {
    return next(error);
  }
};
