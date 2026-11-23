import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";

import * as bcrypt from "bcryptjs";

import { app } from "../src/app";
import { prisma } from "../src/config/prisma";

const email = `register-${randomUUID()}@example.test`;
const password = "test-password-123";
let baseUrl: string;
let server: ReturnType<typeof app.listen> | undefined;

describe("POST /auth/register", () => {
  before(async () => {
    server = app.listen(0);
    await once(server, "listening");

    const address = server.address();
    assert.ok(address && typeof address !== "string");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await prisma.usuario.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("cria usuário, rejeita duplicidade e nunca retorna senha", async () => {
    const invalidResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nome: "Teste", email, senha: "curta" }),
    });

    assert.equal(invalidResponse.status, 400);

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nome: "Usuário de teste",
        email,
        senha: password,
      }),
    });
    const body = (await registerResponse.json()) as {
      user: { id: string; nome: string; email: string; senha?: string };
    };

    assert.equal(registerResponse.status, 201);
    assert.equal(body.user.email, email);
    assert.equal("senha" in body.user, false);

    const storedUser = await prisma.usuario.findUnique({
      where: { email },
      select: { senha: true },
    });
    assert.ok(storedUser);
    assert.notEqual(storedUser.senha, password);
    assert.equal(await bcrypt.compare(password, storedUser.senha), true);

    const duplicateResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nome: "Usuário duplicado",
        email,
        senha: password,
      }),
    });
    const duplicateBody = (await duplicateResponse.json()) as {
      error: string;
    };

    assert.equal(duplicateResponse.status, 400);
    assert.equal(duplicateBody.error, "DUPLICATE_RECORD");
  });

  it("autentica com senha correta e rejeita credenciais inválidas", async () => {
    const invalidPassword = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, senha: "senha-incorreta" }),
    });
    const unknownUser = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: `unknown-${randomUUID()}@example.test`,
        senha: password,
      }),
    });

    assert.equal(invalidPassword.status, 401);
    assert.equal(unknownUser.status, 401);

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    const body = (await loginResponse.json()) as {
      token: string;
      user: { id: string; nome: string; email: string; role: string; senha?: string };
    };

    assert.equal(loginResponse.status, 200);
    assert.ok(body.token);
    assert.equal(body.user.email, email);
    assert.equal(body.user.role, "ALUNO");
    assert.equal("senha" in body.user, false);
  });
});
