import type { RequestHandler } from "express";

import { verifyAuthToken } from "../config/jwt";
import { HttpError } from "../errors/HttpError";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const authorization = request.get("authorization");
  const [scheme, token, ...extra] = authorization?.trim().split(/\s+/) ?? [];

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    extra.length > 0
  ) {
    return next(
      new HttpError(401, "UNAUTHORIZED", "Token ausente ou inválido."),
    );
  }

  const authenticatedUser = verifyAuthToken(token);
  if (!authenticatedUser) {
    return next(
      new HttpError(401, "UNAUTHORIZED", "Token ausente ou inválido."),
    );
  }

  request.authenticatedUser = authenticatedUser;
  return next();
};
