import type { RequestHandler } from "express";

import { authService } from "./auth.service";
import type { PublicUser } from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.schemas";

interface RegisterResponse {
  message: string;
  user: PublicUser;
}

interface LoginResponse {
  message: string;
  token: string;
  user: PublicUser & { role: string };
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

export const loginController: RequestHandler<
  Record<string, string>,
  LoginResponse,
  LoginInput
> = async (request, response, next) => {
  try {
    const result = await authService.login(request.body);

    return response.status(200).json({
      message: "Login realizado com sucesso.",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};
