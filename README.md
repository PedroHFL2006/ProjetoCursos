# Sistema de Cursos Livres

> **Vídeo da apresentação:** preencher com o link do YouTube não listado ou Google Drive.

## Integrantes

Preencha os nomes completos, RGMs e contribuições de todos os integrantes antes da entrega.

| Nome completo | RGM | Contribuição |
| --- | --- | --- |
| Preencher | Preencher | Preencher |

## Sobre o projeto

Monorepo para uma plataforma de cursos livres, com `shared`, `api` e `frontend` gerenciados por npm workspaces.

- **Banco:** PostgreSQL no Docker e Prisma.
- **API:** Node.js, Express e TypeScript.
- **Validação:** Zod, com schemas compartilhados em `shared`.
- **Frontend:** React, Vite e TypeScript; chamadas HTTP com Axios.
- **Autenticação:** JWT e senhas protegidas com bcrypt.

Os modelos principais são `Usuario`, `Professor`, `Aluno`, `Curso` e `Inscricao`. Um curso pertence a um professor; uma inscrição relaciona um aluno e um curso.

## Requisitos

- Node.js compatível com Vite 8 (Node.js 20.19+ ou 22.12+).
- npm.
- Docker Desktop com Docker Compose.

## Como iniciar do zero

Execute os comandos a partir da pasta raiz do repositório.

### 1. Instalar dependências

```powershell
npm install
```

### 2. Criar os arquivos de ambiente

No PowerShell:

```powershell
Copy-Item api\.env.example api\.env
Copy-Item frontend\.env.example frontend\.env
```

No macOS/Linux:

```bash
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
```

Abra `api/.env` e substitua `JWT_SECRET` por uma chave aleatória com pelo menos 32 caracteres. Por exemplo, com Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

O exemplo do frontend aponta para `http://localhost:3001`, a mesma porta configurada para a API em `api/.env.example`. Os arquivos `.env` são locais e não devem ser enviados ao GitHub.

### 3. Iniciar e verificar o PostgreSQL

```powershell
docker compose up -d
docker compose ps
docker compose exec postgres pg_isready -U postgres -d projeto_cursos_db
```

Prossiga quando o PostgreSQL informar que está aceitando conexões. O banco é exposto na porta `5433` do computador e os dados ficam no volume Docker `pgdata`.

### 4. Compilar schemas, aplicar migrations e carregar dados de teste

```powershell
npm run build:shared
npm run prisma:migrate -w api
npm run prisma:generate -w api
npm run prisma:seed -w api
```

> **Atenção:** o seed limpa as tabelas antes de recriar os dados de teste. Use-o somente em um banco local de desenvolvimento.

### 5. Iniciar a API e o frontend

Abra dois terminais na raiz do repositório.

**Terminal 1 — API:**

```powershell
npm run dev -w api
```

A API ficará em `http://localhost:3001`. Verifique se está ativa abrindo `http://localhost:3001/health`; a resposta deve indicar que a API está funcionando.

**Terminal 2 — frontend:**

```powershell
npm run dev -w frontend
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

### 6. Acessar com uma conta do seed

As contas de teste usam a mesma senha:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@email.com` | `123456` |
| Professor | `professor@email.com` | `123456` |
| Aluno | `aluno@gmail.com` | `123456` |

O cadastro pela tela cria uma conta com perfil de aluno. A lista de alunos fica disponível para administradores e para professores, limitada a alunos inscritos em cursos próprios.

## Testes e builds

Com as dependências instaladas e o banco disponível:

```powershell
npm run build:shared
npm run build -w api
npm run test -w api
npm run build -w frontend
npm run lint -w frontend
```

## Encerrar os serviços

Use `Ctrl+C` nos terminais da API e do frontend. Para parar o PostgreSQL sem apagar os dados:

```powershell
docker compose down
```

Para apagar também os dados persistidos do banco, use `docker compose down -v`. Essa operação não pode ser desfeita.

## Estado atual

Cadastro, login, gerenciamento de usuários e a listagem de alunos com controle por perfil estão implementados. As páginas de Professores, Cursos e Inscrições ainda são áreas placeholder; seus CRUDs e a documentação Swagger ainda precisam ser implementados para completar todos os requisitos da atividade.
