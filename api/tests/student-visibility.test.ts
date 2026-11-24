import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";

import { createAuthToken } from "../src/config/jwt";
import { prisma } from "../src/config/prisma";
import { app } from "../src/app";

const suffix = randomUUID();
const accountEmails = {
  admin: `visibility-admin-${suffix}@example.test`,
  professor: `visibility-professor-${suffix}@example.test`,
  otherProfessor: `visibility-other-professor-${suffix}@example.test`,
  enrolledStudent: `visibility-enrolled-${suffix}@example.test`,
  otherStudent: `visibility-other-${suffix}@example.test`,
};

let server: ReturnType<typeof app.listen> | undefined;
let baseUrl: string;
let adminId: string;
let professorId: string;
let otherProfessorId: string;
let enrolledStudentId: string;
let otherStudentId: string;
let professorToken: string;
let studentToken: string;
let adminToken: string;

async function createUser(
  nome: string,
  email: string,
  role: "ADMIN" | "PROFESSOR" | "ALUNO",
): Promise<string> {
  const user = await prisma.usuario.create({
    data: { nome, email, senha: "test-password-hash", role },
    select: { id: true },
  });
  return user.id;
}

describe("visibilidade da lista de alunos", () => {
  before(async () => {
    adminId = await createUser("Admin de teste", accountEmails.admin, "ADMIN");
    professorId = await createUser(
      "Professor de teste",
      accountEmails.professor,
      "PROFESSOR",
    );
    otherProfessorId = await createUser(
      "Outro professor",
      accountEmails.otherProfessor,
      "PROFESSOR",
    );
    enrolledStudentId = await createUser(
      "Aluno matriculado",
      accountEmails.enrolledStudent,
      "ALUNO",
    );
    otherStudentId = await createUser(
      "Outro aluno",
      accountEmails.otherStudent,
      "ALUNO",
    );

    const professor = await prisma.professor.create({
      data: { usuarioId: professorId, especialidade: "Teste" },
      select: { id: true },
    });
    const otherProfessor = await prisma.professor.create({
      data: { usuarioId: otherProfessorId, especialidade: "Teste" },
      select: { id: true },
    });
    const enrolledStudent = await prisma.aluno.create({
      data: { usuarioId: enrolledStudentId, matricula: `A-${suffix}` },
      select: { id: true },
    });
    const otherStudent = await prisma.aluno.create({
      data: { usuarioId: otherStudentId, matricula: `B-${suffix}` },
      select: { id: true },
    });
    const professorCourse = await prisma.curso.create({
      data: {
        titulo: "Curso do professor",
        descricao: "Curso de teste",
        cargaHoraria: 10,
        preco: 0,
        professorId: professor.id,
      },
      select: { id: true },
    });
    const otherProfessorCourse = await prisma.curso.create({
      data: {
        titulo: "Curso de outro professor",
        descricao: "Curso de teste",
        cargaHoraria: 10,
        preco: 0,
        professorId: otherProfessor.id,
      },
      select: { id: true },
    });

    await prisma.inscricao.createMany({
      data: [
        { alunoId: enrolledStudent.id, cursoId: professorCourse.id },
        { alunoId: otherStudent.id, cursoId: otherProfessorCourse.id },
      ],
    });

    adminToken = createAuthToken({ id: adminId, role: "ADMIN" });
    professorToken = createAuthToken({ id: professorId, role: "PROFESSOR" });
    studentToken = createAuthToken({
      id: enrolledStudentId,
      role: "ALUNO",
    });

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

    const users = await prisma.usuario.findMany({
      where: { email: { in: Object.values(accountEmails) } },
      select: {
        professor: { select: { id: true } },
        aluno: { select: { id: true } },
      },
    });
    const professorIds = users.flatMap((user) =>
      user.professor ? [user.professor.id] : [],
    );
    const alunoIds = users.flatMap((user) =>
      user.aluno ? [user.aluno.id] : [],
    );

    await prisma.inscricao.deleteMany({ where: { alunoId: { in: alunoIds } } });
    await prisma.curso.deleteMany({
      where: { professorId: { in: professorIds } },
    });
    await prisma.usuario.deleteMany({
      where: { email: { in: Object.values(accountEmails) } },
    });
    await prisma.$disconnect();
  });

  it("permite ao ADMIN listar todos e limita o PROFESSOR aos próprios cursos", async () => {
    const adminResponse = await fetch(`${baseUrl}/alunos`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const adminBody = (await adminResponse.json()) as {
      alunos: Array<{ matricula: string; usuario: { email: string; senha?: string } }>;
    };

    assert.equal(adminResponse.status, 200);
    const listedEmails = new Set(
      adminBody.alunos.map((aluno) => aluno.usuario.email),
    );
    assert.ok(listedEmails.has(accountEmails.enrolledStudent));
    assert.ok(listedEmails.has(accountEmails.otherStudent));
    assert.ok(
      adminBody.alunos.every((aluno) => !("senha" in aluno.usuario)),
    );

    const professorResponse = await fetch(`${baseUrl}/alunos`, {
      headers: { authorization: `Bearer ${professorToken}` },
    });
    const professorBody = (await professorResponse.json()) as {
      alunos: Array<{ usuario: { email: string } }>;
    };

    assert.equal(professorResponse.status, 200);
    assert.deepEqual(
      professorBody.alunos.map((aluno) => aluno.usuario.email),
      [accountEmails.enrolledStudent],
    );
  });

  it("impede ALUNO de listar alunos e restringe usuários a si mesmos", async () => {
    const studentsResponse = await fetch(`${baseUrl}/alunos`, {
      headers: { authorization: `Bearer ${studentToken}` },
    });
    assert.equal(studentsResponse.status, 403);

    const userListResponse = await fetch(`${baseUrl}/usuarios`, {
      headers: { authorization: `Bearer ${studentToken}` },
    });
    const userListBody = (await userListResponse.json()) as {
      users: Array<{ id: string }>;
    };
    assert.equal(userListResponse.status, 200);
    assert.deepEqual(userListBody.users.map((user) => user.id), [
      enrolledStudentId,
    ]);

    const professorReadingStudent = await fetch(
      `${baseUrl}/usuarios/${enrolledStudentId}`,
      { headers: { authorization: `Bearer ${professorToken}` } },
    );
    assert.equal(professorReadingStudent.status, 403);
  });
});
