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
let userId: string;
let token: string;
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
    userId = body.user.id;
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
    token = body.token;
    assert.equal(body.user.email, email);
    assert.equal(body.user.role, "ALUNO");
    assert.equal("senha" in body.user, false);
  });

  it("protege o CRUD, limita alterações e permite excluir o próprio usuário", async () => {
    const unauthenticated = await fetch(`${baseUrl}/usuarios`);
    const invalidToken = await fetch(`${baseUrl}/usuarios`, {
      headers: { authorization: "Bearer token-invalido" },
    });

    assert.equal(unauthenticated.status, 401);
    assert.equal(invalidToken.status, 401);

    const listResponse = await fetch(`${baseUrl}/usuarios`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const listBody = (await listResponse.json()) as {
      users: Array<{ id: string; senha?: string }>;
    };
    assert.equal(listResponse.status, 200);
    assert.deepEqual(listBody.users.map((user) => user.id), [userId]);
    assert.ok(listBody.users.every((user) => !("senha" in user)));

    const studentsResponse = await fetch(`${baseUrl}/alunos`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(studentsResponse.status, 200);

    const unauthenticatedStudents = await fetch(`${baseUrl}/alunos`);
    assert.equal(unauthenticatedStudents.status, 401);

    const otherUserId = "00000000-0000-4000-8000-000000000001";
    const forbiddenUpdate = await fetch(
      `${baseUrl}/usuarios/${otherUserId}`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ nome: "Alteração não permitida" }),
      },
    );
    const forbiddenDelete = await fetch(
      `${baseUrl}/usuarios/${otherUserId}`,
      {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      },
    );
    assert.equal(forbiddenUpdate.status, 403);
    assert.equal(forbiddenDelete.status, 403);

    const missingUser = await fetch(
      `${baseUrl}/usuarios/00000000-0000-4000-8000-000000000002`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    assert.equal(missingUser.status, 403);

    const updateResponse = await fetch(`${baseUrl}/usuarios/${userId}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nome: "Nome atualizado",
        senha: "updated-password-456",
      }),
    });
    const updateBody = (await updateResponse.json()) as {
      user: { nome: string; senha?: string };
    };

    assert.equal(updateResponse.status, 200);
    assert.equal(updateBody.user.nome, "Nome atualizado");
    assert.equal("senha" in updateBody.user, false);

    const oldPasswordLogin = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    const newPasswordLogin = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, senha: "updated-password-456" }),
    });
    assert.equal(oldPasswordLogin.status, 401);
    assert.equal(newPasswordLogin.status, 200);

    const deleteResponse = await fetch(`${baseUrl}/usuarios/${userId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(deleteResponse.status, 204);

    const deletedUser = await fetch(`${baseUrl}/usuarios/${userId}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.equal(deletedUser.status, 404);
  });
});
