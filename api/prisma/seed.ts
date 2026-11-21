import { PrismaClient, Role, StatusInscricao } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o seed do banco de dados...");

  // Limpa o banco respeitando a integridade referencial (ordem inversa de dependência)
  await prisma.inscricao.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.usuario.deleteMany();

  // Senha padrão criptografa para todos os usuários de teste: '123456'
  const senhaHash = await bcrypt.hash("123456", 10);

  // 1. Criar Administrador padrão
  const admin = await prisma.usuario.create({
    data: {
      nome: "Administrador do Sistema",
      email: "admin@email.com",
      senha: senhaHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin criado: ${admin.email}`);

  // 2. Criar Professor e seu perfil
  const usuarioProfessor = await prisma.usuario.create({
    data: {
      nome: "Professor Pardal",
      email: "professor@email.com",
      senha: senhaHash,
      role: Role.PROFESSOR,
      professor: {
        create: {
          especialidade: "Desenvolvimento Fullstach & TypeScript",
          biografia:
            "Instrutor com mais de 10 anos de experiência em arquitetura web.",
        },
      },
    },
    include: {
      professor: true,
    },
  });
  console.log(`Professor criado: ${usuarioProfessor.email}`);

  // 3. Criar Curso vinculado ao Professor
  const cursoNode = await prisma.curso.create({
    data: {
      titulo: "Arquitetura Monorepo com Node.js e Typescript",
      descricao:
        "Aprenda a estruturar aplicações modernas com Zod, Prisma, Docker e Clean Architecture",
      cargaHoraria: 40,
      preco: 199.9,
      publicado: true,
      professorId: usuarioProfessor.professor!.id,
    },
  });
  console.log(`Curso criado: ${cursoNode.titulo}`);

  // 4. Criar Aluno e seu perfil
  const usuarioAluno = await prisma.usuario.create({
    data: {
      nome: "Aluno Aplicado",
      email: "aluno@gmail.com",
      senha: senhaHash,
      role: Role.ALUNO,
      aluno: {
        create: {
          matricula: "2026-ALU-001",
        },
      },
    },
    include: {
      aluno: true,
    },
  });
  console.log(`Aluno criado: ${usuarioAluno.email}`);

  // 5. Inscrever o Aluno no Curso
  const inscricao = await prisma.inscricao.create({
    data: {
      alunoId: usuarioAluno.aluno!.id,
      cursoId: cursoNode.id,
      status: StatusInscricao.ATIVA,
    },
  });
  console.log(
    `Inscrição criada (Aluno ${usuarioAluno.nome} -> Curso ${cursoNode.titulo})`,
  );

  console.log("Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante e execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
