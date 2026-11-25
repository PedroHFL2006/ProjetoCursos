import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Edit2, Plus, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { criarProfessorSchema } from "@projeto/shared";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { api, getApiErrorMessage } from "../services/api";

const updateProfessorFormSchema = criarProfessorSchema.pick({
  especialidade: true,
  biografia: true,
});

interface Professor {
  id: string;
  usuarioId: string;
  especialidade: string;
  biografia?: string | null;
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

export function ProfessoresPage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "ADMIN";

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");

  // Estado do Modal (null = fechado; "create" = novo; Professor = editando)
  const [modalMode, setModalMode] = useState<"create" | Professor | null>(null);
  const [formUsuarioId, setFormUsuarioId] = useState("");
  const [formEspecialidade, setFormEspecialidade] = useState("");
  const [formBiografia, setFormBiografia] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega a lista com useEffect
  function loadProfessores() {
    setLoading(true);
    api
      .get<{ professores: Professor[] }>("/professores")
      .then(({ data }) => {
        setProfessores(data.professores);
        setError("");
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProfessores();

    // Carrega usuários para o select do modal de criação
    if (isAdmin) {
      api
        .get<{ users: UserOption[] }>("/usuarios")
        .then(({ data }) =>
          setUsers(data.users.filter((u) => u.role === "PROFESSOR")),
        )
        .catch((err) => setUsersError(getApiErrorMessage(err)));
    }
  }, [isAdmin]);

  // Abre modal para Criar
  function handleOpenCreate() {
    setModalMode("create");
    setFormUsuarioId(users[0]?.id || "");
    setFormEspecialidade("");
    setFormBiografia("");
    setFormError("");
  }

  // Abre modal para Editar
  function handleOpenEdit(professor: Professor) {
    setModalMode(professor);
    setFormUsuarioId(professor.usuarioId);
    setFormEspecialidade(professor.especialidade);
    setFormBiografia(professor.biografia || "");
    setFormError("");
  }

  function handleCloseModal() {
    setModalMode(null);
    setFormError("");
  }

  // Salvar (POST ou PUT)
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (modalMode === "create") {
        const validation = criarProfessorSchema.safeParse({
          usuarioId: formUsuarioId,
          especialidade: formEspecialidade,
          biografia: formBiografia || undefined,
        });
        if (!validation.success) {
          setFormError(validation.error.issues.map((issue) => issue.message).join(" "));
          return;
        }

        await api.post("/professores", validation.data);
      } else if (typeof modalMode === "object" && modalMode !== null) {
        const validation = updateProfessorFormSchema.safeParse({
          especialidade: formEspecialidade,
          biografia: formBiografia,
        });
        if (!validation.success) {
          setFormError(validation.error.issues.map((issue) => issue.message).join(" "));
          return;
        }

        await api.put(`/professores/${modalMode.id}`, {
          ...validation.data,
        });
      }

      handleCloseModal();
      loadProfessores();
      setError("");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Exclusão com confirmação
  async function handleDelete(id: string, nome: string) {
    if (!window.confirm(`Deseja realmente excluir o professor "${nome}"?`)) {
      return;
    }

    try {
      await api.delete(`/professores/${id}`);
      loadProfessores();
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

          {isAdmin && (
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
              <Plus size={16} /> Novo Professor
            </button>
          )}
        </div>

        <p className="eyebrow">CORPO DOCENTE</p>
        <h1>Professores</h1>
        <p className="workspace-intro">
          Gerencie os professores e instrutores da plataforma.
        </p>
        {usersError && (
          <p className="student-list-message student-list-error" role="alert">
            {usersError}
          </p>
        )}

        {loading ? (
          <p className="student-list-message">Carregando professores...</p>
        ) : error ? (
          <p className="student-list-message student-list-error">{error}</p>
        ) : professores.length === 0 ? (
          <p className="student-list-message">Nenhum professor cadastrado.</p>
        ) : (
          <ul className="student-list">
            {professores.map((prof) => (
              <li
                className="student-card"
                key={prof.id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <span className="student-avatar">
                    {prof.usuario.nome.charAt(0).toUpperCase()}
                  </span>
                  <span className="student-details">
                    <strong>{prof.usuario.nome}</strong>
                    <span>{prof.usuario.email}</span>
                    <small style={{ color: "#818cf8" }}>
                      {prof.especialidade}
                    </small>
                  </span>
                </div>

                {isAdmin && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(prof)}
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
                      onClick={() => handleDelete(prof.id, prof.usuario.nome)}
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
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Modal único de Criar/Editar */}
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
                  ? "Cadastrar Novo Professor"
                  : "Editar Professor"}
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
                    Usuário com perfil Professor:
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
                    <small>Não há usuários com perfil de professor disponíveis.</small>
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
                  Especialidade:
                </label>
                <input
                  type="text"
                  value={formEspecialidade}
                  onChange={(e) => setFormEspecialidade(e.target.value)}
                  placeholder="Ex: Inteligência Artificial, React..."
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

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Biografia (opcional):
                </label>
                <textarea
                  value={formBiografia}
                  onChange={(e) => setFormBiografia(e.target.value)}
                  placeholder="Breve resumo da trajetória profissional..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    resize: "none",
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
