import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";

const navigation = [
  { label: "Professores", href: "/professores", icon: Users },
  { label: "Alunos", href: "/alunos", icon: GraduationCap },
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Inscrições", href: "/inscricoes", icon: ClipboardList },
];

export function HomePage() {
  const { session } = useAuth();
  const visibleNavigation = navigation.filter(
    ({ href }) =>
      href !== "/alunos" ||
      session?.user.role === "ADMIN" ||
      session?.user.role === "PROFESSOR",
  );

  return (
    <main className="workspace-page min-h-screen">
      <WorkspaceHeader />

      <section className="workspace-content">
        <p className="eyebrow">PAINEL DO ALUNO</p>
        <h1>Bem-vindo, {session?.user.nome}.</h1>
        <p className="workspace-intro">
          Continue aprendendo. Escolha uma área para explorar a plataforma.
        </p>

        <nav className="resource-grid" aria-label="Navegação principal">
          {visibleNavigation.map(({ label, href, icon: Icon }) => (
            <Link className="resource-card" key={href} to={href}>
              <span className="resource-icon"><Icon size={20} /></span>
              <span>{label}</span>
              <span className="resource-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
