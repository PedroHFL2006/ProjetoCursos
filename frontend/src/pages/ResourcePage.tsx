import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const resourceNames: Record<string, string> = {
  professores: "Professores",
  alunos: "Alunos",
  cursos: "Cursos",
  inscricoes: "Inscrições",
};

export function ResourcePage() {
  const { resource = "" } = useParams();
  const title = resourceNames[resource];

  if (!title) {
    return (
      <main className="workspace-page">
        <section className="workspace-content">
          <h1>Página não encontrada</h1>
          <Link className="text-link" to="/">Voltar ao início</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-page">
      <section className="workspace-content">
        <Link className="back-link" to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar ao painel
        </Link>
        <p className="eyebrow">EM BREVE</p>
        <h1>{title}</h1>
        <p className="workspace-intro">
          Esta área será implementada em uma próxima etapa do projeto.
        </p>
      </section>
    </main>
  );
}
