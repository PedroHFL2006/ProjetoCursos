import type { RequestHandler } from "express";

import { HttpError } from "../../errors/HttpError";
import type { AuthenticatedUser } from "../../config/jwt";
import { usersService } from "./users.service";
import type { UpdateUserInput } from "./users.schemas";
import { userIdSchema } from "./users.schemas";

function getAuthenticatedUser(request: Express.Request): AuthenticatedUser {
  if (!request.authenticatedUser) {
    throw new HttpError(401, "UNAUTHORIZED", "Autenticação necessária.");
  }

  return request.authenticatedUser;
}

function parseUserId(value: unknown): string {
  const result = userIdSchema.safeParse(value);
  if (!result.success) {
    throw new HttpError(400, "VALIDATION_ERROR", "ID de usuário inválido.");
  }

  return result.data;
}

export const listUsersController: RequestHandler = async (
  request,
  response,
) => {
  const users = await usersService.list(getAuthenticatedUser(request));
  return response.status(200).json({ users });
};

export const getUserController: RequestHandler = async (request, response) => {
  const id = parseUserId(request.params.id);
  const user = await usersService.findById(
    id,
    getAuthenticatedUser(request),
  );
  return response.status(200).json({ user });
};

export const updateUserController: RequestHandler<
  { id: string },
  unknown,
  UpdateUserInput
> = async (request, response) => {
  const id = parseUserId(request.params.id);
  const user = await usersService.update(
    id,
    getAuthenticatedUser(request),
    request.body,
  );
  return response.status(200).json({ user });
};

export const deleteUserController: RequestHandler = async (
  request,
  response,
) => {
  const id = parseUserId(request.params.id);
  await usersService.delete(id, getAuthenticatedUser(request));
  return response.status(204).end();
};
