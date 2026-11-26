import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Edit2, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { criarAlunoSchema } from "@projeto/shared";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { api, getApiErrorMessage } from "../services/api";

const updateStudentFormSchema = criarAlunoSchema.pick({ matricula: true });

interface Student {
  id: string;
  matricula: string;
  usuarioId: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface UserOption {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export function StudentsPage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "ADMIN";

  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");

  // Modal (null = fechado; "create" = novo; Student = editando)
  const [modalMode, setModalMode] = useState<"create" | Student | null>(null);
  const [formUsuarioId, setFormUsuarioId] = useState("");
  const [formMatricula, setFormMatricula] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadStudents() {
    setLoading(true);
    api
      .get<{ alunos: Student[] }>("/alunos")
      .then(({ data }) => {
        setStudents(data.alunos);
        setError("");
      })
      .catch((requestError: unknown) =>
        setError(getApiErrorMessage(requestError)),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStudents();

    api
      .get<{ users: UserOption[] }>("/usuarios")
      .then(({ data }) => {
        const selectableUsers = isAdmin
          ? data.users.filter((user) => user.role === "ALUNO")
          : data.users.filter((user) => user.id === session?.user.id);
        setUsers(selectableUsers);
      })
      .catch((requestError: unknown) =>
        setUsersError(getApiErrorMessage(requestError)),
      );
  }, [isAdmin, session?.user.id]);

  function handleOpenCreate() {
    setModalMode("create");
    setFormUsuarioId(users[0]?.id || "");
    setFormMatricula("");
    setFormError("");
  }

  function handleOpenEdit(student: Student) {
    setModalMode(student);
    setFormUsuarioId(student.usuarioId);
    setFormMatricula(student.matricula);
    setFormError("");
  }

  function handleCloseModal() {
    setModalMode(null);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (modalMode === "create") {
        const validation = criarAlunoSchema.safeParse({
          usuarioId: formUsuarioId,
          matricula: formMatricula,
        });
        if (!validation.success) {
          setFormError(validation.error.issues.map((issue) => issue.message).join(" "));
          return;
        }

        await api.post("/alunos", validation.data);
      } else if (typeof modalMode === "object" && modalMode !== null) {
        const validation = updateStudentFormSchema.safeParse({
          matricula: formMatricula,
        });
        if (!validation.success) {
          setFormError(validation.error.issues.map((issue) => issue.message).join(" "));
          return;
        }

        await api.put(`/alunos/${modalMode.id}`, {
          ...validation.data,
        });
      }

      handleCloseModal();
      loadStudents();
      setError("");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!window.confirm(`Deseja realmente excluir o aluno "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/alunos/${id}`);
      loadStudents();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="workspace-page min-h-screen">
      <WorkspaceHeader />
      <section className="workspace-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link className="back-link" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao painel
          </Link>

          <button
            onClick={handleOpenCreate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "#6366f1",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Plus size={16} /> Novo Aluno
          </button>
        </div>

        <p className="eyebrow">GESTÃO ACADÊMICA</p>
        <h1>Alunos</h1>
        <p className="workspace-intro">Alunos cadastrados na plataforma.</p>
        {usersError && (
          <p className="student-list-message student-list-error" role="alert">
            {usersError}
          </p>
        )}

        {loading ? (
          <p className="student-list-message">Carregando alunos...</p>
        ) : error ? (
          <p className="student-list-message student-list-error" role="alert">
            {error}
          </p>
        ) : students.length === 0 ? (
          <p className="student-list-message">Nenhum aluno cadastrado.</p>
        ) : (
          <ul className="student-list">
            {students.map((student) => (
              <li
                className="student-card"
                key={student.id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
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
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(student)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "6px",
                    }}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(student.id, student.usuario.nome)
                    }
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#f43f5e",
                      cursor: "pointer",
                      padding: "6px",
                    }}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal único de Criar/Editar Aluno */}
      {modalMode && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              color: "#f8fafc",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                {modalMode === "create"
                  ? "Cadastrar Novo Aluno"
                  : "Editar Aluno"}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <p
                style={{
                  color: "#f43f5e",
                  background: "rgba(244,63,94,0.1)",
                  padding: "10px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                }}
              >
                {formError}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {modalMode === "create" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "0.875rem",
                      color: "#cbd5e1",
                    }}
                  >
                    Usuário com perfil Aluno:
                  </label>
                  <select
                    value={formUsuarioId}
                    onChange={(e) => setFormUsuarioId(e.target.value)}
                    required
                    disabled={users.length === 0}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid #334155",
                    }}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.email})
                      </option>
                    ))}
                  </select>
                  {users.length === 0 && !usersError && (
                    <small>Não há usuários com perfil de aluno disponíveis.</small>
                  )}
                </div>
              )}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Número da Matrícula:
                </label>
                <input
                  type="text"
                  value={formMatricula}
                  onChange={(e) => setFormMatricula(e.target.value)}
                  placeholder="Ex: 2026-ALU-002"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    background: "#334155",
                    color: "#f8fafc",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
