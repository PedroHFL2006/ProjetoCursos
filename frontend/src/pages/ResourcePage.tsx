import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { CursosPage } from "./CursosPage";
import { InscricoesPage } from "./InscricoesPage";
import { ProfessoresPage } from "./ProfessoresPage";
import { StudentsPage } from "./StudentsPage";

const resourceNames: Record<string, string> = {
  professores: "Professores",
  alunos: "Alunos",
  cursos: "Cursos",
  inscricoes: "Inscrições",
};

export function ResourcePage() {
  const { resource = "" } = useParams();
  const title = resourceNames[resource];

  // Roteamento interno para as entidades completas
  if (resource === "alunos") {
    return <StudentsPage />;
  }

  if (resource === "professores") {
    return <ProfessoresPage />;
  }

  if (resource === "cursos") {
    return <CursosPage />;
  }

  if (resource === "inscricoes") {
    return <InscricoesPage />;
  }

  return (
    <main className="workspace-page min-h-screen">
      <WorkspaceHeader />
      <section className="workspace-content">
        {title ? (
          <>
            <Link className="back-link" to="/">
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar ao painel
            </Link>
            <p className="eyebrow">EM BREVE</p>
            <h1>{title}</h1>
            <p className="workspace-intro">
              Esta área será implementada em uma próxima etapa do projeto.
            </p>
          </>
        ) : (
          <>
            <h1>Página não encontrada</h1>
            <Link className="text-link" to="/">
              Voltar ao início
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
