# Projeto Cursos 🎓

Plataforma completa de gerenciamento e consumo de cursos online, estruturada como um **Monorepo** moderno para compartilhar contratos, regras de validação e tipagens estáticas entre o Backend e o Frontend.

---

## 🏛️ Arquitetura do Monorepo

O projeto utiliza **npm workspaces** para centralizar dependências e permitir o desenvolvimento integrado de múltiplos pacotes em um único repositório:

```text
ProjetoCursos/
├── api/                  # Backend da aplicação (em desenvolvimento)
│   └── .env.example      # Modelo de variáveis de ambiente do backend
├── frontend/             # Interface do usuário (em desenvolvimento)
├── shared/               # Biblioteca interna de schemas Zod e tipos TypeScript
│   ├── src/
│   │   ├── schemas/      # Schemas das entidades (validação e tipagem)
│   │   └── index.ts      # Ponto de entrada (barrel export)
│   ├── tsconfig.json     # Configuração de compilação do TypeScript
│   └── package.json      # Configuração do pacote @projeto/shared
├── docker-compose.yml    # Orquestração do banco de dados (PostgreSQL 16)
├── .gitignore            # Arquivos e pastas ignorados pelo controle de versão
└── package.json          # Orquestrador raiz com os workspaces
```

---

## 📦 Pacote Shared (`@projeto/shared`)

O pacote `shared` atua como a **única fonte da verdade** (_Single Source of Truth_) para dados e validações:

- **Zod**: Schemas para validação de entrada de dados (DTOs) tanto na API quanto nos formulários do Frontend.
- **TypeScript (`z.infer`)**: Geração automática de tipos estáticos derivados dos schemas Zod, eliminando duplicidade de código.

### Entidades Modeladas:

- **Usuário (`Usuario`)**: Controle de acesso, autenticação e papéis (`ADMIN`, `PROFESSOR`, `ALUNO`).
- **Professor (`Professor`)**: Perfil do instrutor, especialidade e biografia.
- **Aluno (`Aluno`)**: Perfil do estudante e matrícula.
- **Curso (`Curso`)**: Catálogo de cursos, carga horária, preço e instrutor responsável.
- **Inscrição (`Inscricao`)**: Matrícula do aluno no curso e status (`PENDENTE`, `ATIVA`, `CANCELADA`, `CONCLUIDA`).

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** (LTS) & **Workspaces**
- **TypeScript**
- **Zod** (Validação de schemas e inferência de tipos)
- **Docker & Docker Compose** (Containerização do banco de dados)
- **PostgreSQL 16**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Docker](https://www.docker.com/) e Docker Compose instalados

### 1. Clonar e Instalar Dependências

Na raiz do projeto, instale as dependências de todos os workspaces com um único comando:

```bash
npm install
```

### 2. Iniciar o Banco de Dados (PostgreSQL)

Suba o container do banco de dados em segundo plano:

```bash
docker compose up -d
```

> O PostgreSQL ficará disponível na porta padrão `5433`. Os dados são persistidos através do volume `pgdata`.

### 3. Compilar o Pacote Shared

Antes de rodar a API ou o Frontend, compile o código TypeScript do pacote compartilhado:

```bash
npm run build:shared
```

Para continuar desenvolvendo e alterando schemas com recompilação automática:

```bash
npm run dev:shared
```

---

## 📜 Scripts Disponíveis na Raiz

| Comando                | Descrição                                                     |
| :--------------------- | :------------------------------------------------------------ |
| `npm run build:shared` | Compila o pacote `shared` uma única vez para a pasta `dist/`. |
| `npm run dev:shared`   | Inicia o compilador do `shared` em modo observador (`watch`). |

---

## 📌 Próximos Passos (Roadmap)

- [x] **Etapa 1:** Fundação do Monorepo, Docker com PostgreSQL e Schemas compartilhados (`shared`).
- [x] **Etapa 2:** Inicialização da API (Fastify/Express), conexão com o PostgreSQL via ORM e autenticação JWT.
- [ ] **Etapa 3:** Desenvolvimento dos endpoints da API e regras de negócio.
- [ ] **Etapa 4:** Inicialização e desenvolvimento do Frontend consumindo os schemas do `shared`.
