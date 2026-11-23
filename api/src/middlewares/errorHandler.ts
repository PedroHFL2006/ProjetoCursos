import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { HttpError } from "../errors/HttpError";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    return next(error);
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Os dados enviados são inválidos.",
      error: "VALIDATION_ERROR",
      fields: error.issues.map((issue) => ({
        field: issue.path.map(String).join(".") || "body",
        message: issue.message,
      })),
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      message: error.message,
      error: error.code,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      const isEmailConstraint = Array.isArray(target)
        ? target.includes("email")
        : typeof target === "string" && target.includes("email");

      return response.status(400).json({
        message: isEmailConstraint
          ? "Este e-mail já está cadastrado."
          : "Um registro com esses dados já existe.",
        error: "DUPLICATE_RECORD",
      });
    }

    if (error.code === "P2025") {
      return response.status(404).json({
        message: "O registro não foi encontrado.",
        error: "NOT_FOUND",
      });
    }
  }

  console.error("Erro inesperado na API:", error);

  return response.status(500).json({
    message: "Ocorreu um erro interno. Tente novamente mais tarde.",
    error: "INTERNAL_SERVER_ERROR",
  });
};
