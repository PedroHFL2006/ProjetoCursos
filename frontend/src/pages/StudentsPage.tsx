import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { api, getApiErrorMessage } from "../services/api";

interface Student {
  id: string;
  matricula: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface StudentsResponse {
  alunos: Student[];
}

export function StudentsPage() {
  const { session } = useAuth();
  const role = session?.user.role;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "ADMIN" && role !== "PROFESSOR") {
      return;
    }

    let active = true;
    api
      .get<StudentsResponse>("/alunos")
      .then(({ data }) => {
        if (active) setStudents(data.alunos);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [role]);

  return (
    <main className="workspace-page min-h-screen">
      <WorkspaceHeader />
      <section className="workspace-content">
        <Link className="back-link" to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar ao painel
        </Link>

        {role !== "ADMIN" && role !== "PROFESSOR" ? (
          <>
            <p className="eyebrow">ACESSO RESTRITO</p>
            <h1>Alunos</h1>
            <p className="workspace-intro">
              Seu perfil não tem permissão para visualizar a lista de alunos.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">GESTÃO ACADÊMICA</p>
            <h1>Alunos</h1>
            <p className="workspace-intro">
              {role === "PROFESSOR"
                ? "Alunos inscritos nos cursos que você ministra."
                : "Alunos cadastrados na plataforma."}
            </p>

            {loading ? (
              <p className="student-list-message">Carregando alunos...</p>
            ) : error ? (
              <p className="student-list-message student-list-error" role="alert">
                {error}
              </p>
            ) : students.length === 0 ? (
              <p className="student-list-message">
                Nenhum aluno encontrado para esta área.
              </p>
            ) : (
              <ul className="student-list">
                {students.map((student) => (
                  <li className="student-card" key={student.id}>
                    <span className="student-avatar" aria-hidden="true">
                      {student.usuario.nome.charAt(0).toUpperCase()}
                    </span>
                    <span className="student-details">
                      <strong>{student.usuario.nome}</strong>
                      <span>{student.usuario.email}</span>
                    </span>
                    <span className="student-registration">
                      Matrícula {student.matricula}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
