export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Plataforma de Cursos API",
    version: "1.0.0",
    description:
      "Documentação completa dos endpoints da API de gerenciamento de cursos, professores, alunos e inscrições.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Servidor Local de Desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Insira o token JWT no formato: Bearer <seu_token>",
      },
    },
    schemas: {
      Usuario: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string", example: "Administrador do Sistema" },
          email: {
            type: "string",
            format: "email",
            example: "admin@email.com",
          },
          role: {
            type: "string",
            enum: ["ADMIN", "PROFESSOR", "ALUNO"],
            example: "ADMIN",
          },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
        },
      },
      Professor: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          usuarioId: { type: "string", format: "uuid" },
          especialidade: { type: "string", example: "Fullstack & TypeScript" },
          biografia: {
            type: "string",
            example: "Instrutor com vasta experiência em arquitetura web.",
          },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
          usuario: { $ref: "#/components/schemas/Usuario" },
        },
      },
      Aluno: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          usuarioId: { type: "string", format: "uuid" },
          matricula: { type: "string", example: "2026-ALU-001" },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
          usuario: { $ref: "#/components/schemas/Usuario" },
        },
      },
      Curso: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          titulo: {
            type: "string",
            example: "Arquitetura Monorepo com Node.js",
          },
          descricao: {
            type: "string",
            example:
              "Aprenda a estruturar aplicações modernas com Zod e Prisma.",
          },
          cargaHoraria: { type: "integer", example: 40 },
          preco: { type: "number", example: 199.9 },
          publicado: { type: "boolean", example: true },
          professorId: { type: "string", format: "uuid" },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
          professor: { $ref: "#/components/schemas/Professor" },
        },
      },
      Inscricao: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          alunoId: { type: "string", format: "uuid" },
          cursoId: { type: "string", format: "uuid" },
          status: {
            type: "string",
            enum: ["PENDENTE", "ATIVA", "CANCELADA", "CONCLUIDA"],
            example: "ATIVA",
          },
          dataMatricula: { type: "string", format: "date-time" },
          concluidoEm: { type: "string", format: "date-time", nullable: true },
          aluno: { $ref: "#/components/schemas/Aluno" },
          curso: { $ref: "#/components/schemas/Curso" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Mensagem descritiva do erro." },
          error: { type: "string", example: "ERROR_CODE" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastrar novo usuário (perfil Aluno)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha"],
                properties: {
                  nome: { type: "string", example: "Novo Aluno" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "novoaluno@email.com",
                  },
                  senha: {
                    type: "string",
                    minLength: 8,
                    example: "senhaSegura123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Usuário cadastrado com sucesso." },
          400: {
            description: "Dados inválidos ou e-mail já cadastrado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autenticar usuário e obter token JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@email.com",
                  },
                  senha: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login realizado com sucesso.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Login realizado com sucesso.",
                    },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsIn...",
                    },
                    user: { $ref: "#/components/schemas/Usuario" },
                  },
                },
              },
            },
          },
          401: { description: "E-mail ou senha inválidos." },
        },
      },
    },
    "/professores": {
      get: {
        tags: ["Professores"],
        summary: "Listar todos os professores",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Lista de professores recuperada.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    professores: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Professor" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Não autenticado." },
        },
      },
      post: {
        tags: ["Professores"],
        summary: "Criar perfil de professor",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["usuarioId", "especialidade"],
                properties: {
                  usuarioId: { type: "string", format: "uuid" },
                  especialidade: {
                    type: "string",
                    example: "Inteligência Artificial",
                  },
                  biografia: {
                    type: "string",
                    example: "Mestre em Ciência da Computação.",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Professor criado com sucesso." },
          400: {
            description:
              "Dados inválidos ou usuário já possui perfil de professor.",
          },
        },
      },
    },
    "/professores/{id}": {
      get: {
        tags: ["Professores"],
        summary: "Buscar professor por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Professor encontrado." },
          404: { description: "Professor não encontrado." },
        },
      },
      put: {
        tags: ["Professores"],
        summary: "Atualizar professor por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  especialidade: { type: "string", example: "Fullstack" },
                  biografia: { type: "string", example: "Nova biografia." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Professor atualizado com sucesso." },
          404: { description: "Professor não encontrado." },
        },
      },
      delete: {
        tags: ["Professores"],
        summary: "Excluir professor por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Professor excluído com sucesso." },
          404: { description: "Professor não encontrado." },
        },
      },
    },
    "/alunos": {
      get: {
        tags: ["Alunos"],
        summary: "Listar alunos",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de alunos recuperada." },
          401: { description: "Não autenticado." },
          403: { description: "Acesso restrito a ADMIN e PROFESSOR." },
        },
      },
      post: {
        tags: ["Alunos"],
        summary: "Criar perfil de aluno",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["usuarioId", "matricula"],
                properties: {
                  usuarioId: { type: "string", format: "uuid" },
                  matricula: { type: "string", example: "2026-ALU-002" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Aluno criado com sucesso." },
          400: { description: "Dados inválidos ou matrícula já em uso." },
        },
      },
    },
    "/alunos/{id}": {
      get: {
        tags: ["Alunos"],
        summary: "Buscar aluno por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Aluno encontrado." },
          404: { description: "Aluno não encontrado." },
        },
      },
      put: {
        tags: ["Alunos"],
        summary: "Atualizar aluno por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  matricula: { type: "string", example: "2026-ALU-099" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Aluno atualizado com sucesso." },
          404: { description: "Aluno não encontrado." },
        },
      },
      delete: {
        tags: ["Alunos"],
        summary: "Excluir aluno por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Aluno excluído com sucesso." },
          404: { description: "Aluno não encontrado." },
        },
      },
    },
    "/cursos": {
      get: {
        tags: ["Cursos"],
        summary: "Listar todos os cursos (com professor)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de cursos recuperada." },
          401: { description: "Não autenticado." },
        },
      },
      post: {
        tags: ["Cursos"],
        summary: "Criar novo curso",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "titulo",
                  "descricao",
                  "cargaHoraria",
                  "preco",
                  "professorId",
                ],
                properties: {
                  titulo: {
                    type: "string",
                    example: "React 19 do Zero ao Avançado",
                  },
                  descricao: {
                    type: "string",
                    example: "Domine React, Hooks, Context API e Tailwind.",
                  },
                  cargaHoraria: { type: "integer", example: 60 },
                  preco: { type: "number", example: 149.9 },
                  professorId: { type: "string", format: "uuid" },
                  publicado: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Curso criado com sucesso." },
          400: { description: "Dados inválidos." },
          404: { description: "Professor informado não existe." },
        },
      },
    },
    "/cursos/{id}": {
      get: {
        tags: ["Cursos"],
        summary: "Buscar curso por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Curso encontrado." },
          404: { description: "Curso não encontrado." },
        },
      },
      put: {
        tags: ["Cursos"],
        summary: "Atualizar curso por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  cargaHoraria: { type: "integer" },
                  preco: { type: "number" },
                  publicado: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Curso atualizado com sucesso." },
          404: { description: "Curso não encontrado." },
        },
      },
      delete: {
        tags: ["Cursos"],
        summary: "Excluir curso por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Curso excluído com sucesso." },
          404: { description: "Curso não encontrado." },
        },
      },
    },
    "/inscricoes": {
      get: {
        tags: ["Inscrições"],
        summary: "Listar todas as inscrições (com aluno e curso)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Lista de inscrições recuperada." },
          401: { description: "Não autenticado." },
        },
      },
      post: {
        tags: ["Inscrições"],
        summary: "Inscrever aluno em um curso",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["alunoId", "cursoId"],
                properties: {
                  alunoId: { type: "string", format: "uuid" },
                  cursoId: { type: "string", format: "uuid" },
                  status: {
                    type: "string",
                    enum: ["PENDENTE", "ATIVA", "CANCELADA", "CONCLUIDA"],
                    default: "ATIVA",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Inscrição realizada com sucesso." },
          400: { description: "Aluno já inscrito neste curso." },
          404: { description: "Aluno ou curso não encontrado." },
        },
      },
    },
    "/inscricoes/{id}": {
      get: {
        tags: ["Inscrições"],
        summary: "Buscar inscrição por ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "Inscrição encontrada." },
          404: { description: "Inscrição não encontrada." },
        },
      },
      put: {
        tags: ["Inscrições"],
        summary: "Alterar status da inscrição",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDENTE", "ATIVA", "CANCELADA", "CONCLUIDA"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Status atualizado com sucesso." },
          404: { description: "Inscrição não encontrada." },
        },
      },
      delete: {
        tags: ["Inscrições"],
        summary: "Cancelar/Remover inscrição",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          204: { description: "Inscrição removida com sucesso." },
          404: { description: "Inscrição não encontrada." },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Checar status de saúde da API",
        responses: {
          200: { description: "API ativa e funcionando." },
        },
      },
    },
  },
};
