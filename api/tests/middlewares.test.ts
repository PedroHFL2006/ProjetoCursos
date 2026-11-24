import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import express from "express";
import { Prisma } from "@prisma/client";
import { criarCursoSchema } from "@projeto/shared";
import { z } from "zod";

import { errorHandler } from "../src/middlewares/errorHandler";
import { validarBody } from "../src/middlewares/validarBody";

const testApp = express();

testApp.use(express.json());
testApp.post(
  "/validar",
  validarBody(criarCursoSchema),
  (request, response) => response.status(200).json(request.body),
);
testApp.get("/erro-zod", (_request, _response, next) => {
  const result = z.string().safeParse(42);
  if (!result.success) {
    return next(result.error);
  }
  return next();
});
testApp.get("/erro-prisma/:code", (request, _response, next) => {
  const code = request.params.code;
  if (code !== "P2002" && code !== "P2025") {
    return next(new Error("Erro interno de teste"));
  }

  return next(
    new Prisma.PrismaClientKnownRequestError("Internal database details", {
      code,
      clientVersion: "test",
      meta: code === "P2002" ? { target: ["email"] } : undefined,
    }),
  );
});
testApp.use(errorHandler);

describe("middlewares da API", () => {
  let baseUrl: string;
  let server: ReturnType<typeof testApp.listen>;

  before(async () => {
    server = testApp.listen(0);
    await once(server, "listening");

    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    server.close();
    await once(server, "close");
  });

  it("retorna os campos inválidos no formato esperado", async () => {
    const response = await fetch(`${baseUrl}/validar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ titulo: "A" }),
    });
    const body = (await response.json()) as {
      message: string;
      error: string;
      fields: Array<{ field: string; message: string }>;
    };

    assert.equal(response.status, 400);
    assert.equal(body.error, "VALIDATION_ERROR");
    assert.ok(body.fields.some((field) => field.field === "titulo"));
  });

  it("substitui o body pelos dados validados", async () => {
    const response = await fetch(`${baseUrl}/validar`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        titulo: "Curso válido",
        descricao: "Descrição válida para o curso",
        cargaHoraria: 10,
        preco: 25,
        professorId: "00000000-0000-4000-8000-000000000001",
        campoExtra: "remover",
      }),
    });
    const body = (await response.json()) as Record<string, unknown>;

    assert.equal(response.status, 200);
    assert.equal(body.publicado, false);
    assert.equal("campoExtra" in body, false);
  });

  it("converte os erros Zod e Prisma em respostas consistentes", async () => {
    const zodResponse = await fetch(`${baseUrl}/erro-zod`);
    const zodBody = (await zodResponse.json()) as {
      error: string;
      fields: Array<{ field: string }>;
    };
    const duplicateResponse = await fetch(`${baseUrl}/erro-prisma/P2002`);
    const duplicateBody = (await duplicateResponse.json()) as {
      message: string;
      error: string;
    };
    const missingResponse = await fetch(`${baseUrl}/erro-prisma/P2025`);
    const missingBody = (await missingResponse.json()) as { error: string };

    assert.equal(zodResponse.status, 400);
    assert.equal(zodBody.error, "VALIDATION_ERROR");
    assert.equal(zodBody.fields[0]?.field, "body");
    assert.equal(duplicateResponse.status, 400);
    assert.equal(duplicateBody.message, "Este e-mail já está cadastrado.");
    assert.equal(duplicateBody.error, "DUPLICATE_RECORD");
    assert.equal(missingResponse.status, 404);
    assert.equal(missingBody.error, "NOT_FOUND");
  });

  it("oculta detalhes de erros inesperados na resposta", async () => {
    const response = await fetch(`${baseUrl}/erro-prisma/OTHER`);
    const body = (await response.json()) as {
      message: string;
      error: string;
    };

    assert.equal(response.status, 500);
    assert.equal(body.error, "INTERNAL_SERVER_ERROR");
    assert.equal(
      body.message,
      "Ocorreu um erro interno. Tente novamente mais tarde.",
    );
    assert.equal(JSON.stringify(body).includes("Erro interno de teste"), false);
  });
});
