import type { RequestHandler } from "express";
import type { ZodType, ZodTypeDef } from "zod";

export function validarBody<Output, Input = Output>(
  schema: ZodType<Output, ZodTypeDef, Input>,
): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        message: "Os dados enviados são inválidos.",
        error: "VALIDATION_ERROR",
        fields: result.error.issues.map((issue) => ({
          field: issue.path.map(String).join(".") || "body",
          message: issue.message,
        })),
      });
    }

    request.body = result.data;
    return next();
  };
}
