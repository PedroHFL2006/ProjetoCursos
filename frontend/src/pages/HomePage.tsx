import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  LogOut,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

const navigation = [
  { label: "Professores", href: "/professores", icon: Users },
  { label: "Alunos", href: "/alunos", icon: GraduationCap },
  { label: "Cursos", href: "/cursos", icon: BookOpen },
  { label: "Inscrições", href: "/inscricoes", icon: ClipboardList },
];

export function HomePage() {
  const { session, logout } = useAuth();

  return (
    <main className="workspace-page min-h-screen">
      <header className="workspace-header">
        <Link className="workspace-brand" to="/">
          <span className="brand-mark">C</span>
          <span>Cursos<span className="brand-accent">.</span></span>
        </Link>
        <button className="logout-button" onClick={logout} type="button">
          <LogOut size={17} aria-hidden="true" />
          Sair
        </button>
      </header>

      <section className="workspace-content">
        <p className="eyebrow">PAINEL DO ALUNO</p>
        <h1>Bem-vindo, {session?.user.nome}.</h1>
        <p className="workspace-intro">
          Continue aprendendo. Escolha uma área para explorar a plataforma.
        </p>

        <nav className="resource-grid" aria-label="Navegação principal">
          {navigation.map(({ label, href, icon: Icon }) => (
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
