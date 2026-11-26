import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { api, getApiErrorMessage } from "../services/api";

interface AlunoOption {
  id: string;
  matricula: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface CursoOption {
  id: string;
  titulo: string;
  cargaHoraria: number;
}

interface Inscricao {
  id: string;
  alunoId: string;
  cursoId: string;
  status: "PENDENTE" | "ATIVA" | "CANCELADA" | "CONCLUIDA";
  dataMatricula: string;
  concluidoEm?: string | null;
  aluno: {
    id: string;
    matricula: string;
    usuario: {
      id: string;
      nome: string;
      email: string;
    };
  };
  curso: {
    id: string;
    titulo: string;
    cargaHoraria: number;
    preco: number | string;
  };
}

const statusColors: Record<string, { bg: string; text: string }> = {
  ATIVA: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  PENDENTE: { bg: "rgba(234,179,8,0.15)", text: "#facc15" },
  CONCLUIDA: { bg: "rgba(99,102,241,0.15)", text: "#818cf8" },
  CANCELADA: { bg: "rgba(244,63,94,0.15)", text: "#f43f5e" },
};

export function InscricoesPage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "ADMIN";

  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [alunos, setAlunos] = useState<AlunoOption[]>([]);
  const [cursos, setCursos] = useState<CursoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Estado do Modal
  const [modalMode, setModalMode] = useState<"create" | Inscricao | null>(null);
  const [formAlunoId, setFormAlunoId] = useState("");
  const [formCursoId, setFormCursoId] = useState("");
  const [formStatus, setFormStatus] = useState<
    "PENDENTE" | "ATIVA" | "CANCELADA" | "CONCLUIDA"
  >("ATIVA");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadInscricoes() {
    setLoading(true);
    api
      .get<{ inscricoes: Inscricao[] }>("/inscricoes")
      .then(({ data }) => setInscricoes(data.inscricoes))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInscricoes();

    // Carrega Alunos e Cursos para os selects dinâmicos do modal
    api
      .get<{ alunos: AlunoOption[] }>("/alunos")
      .then(({ data }) => setAlunos(data.alunos))
      .catch(() => {});

    api
      .get<{ cursos: CursoOption[] }>("/cursos")
      .then(({ data }) => setCursos(data.cursos))
      .catch(() => {});
  }, []);

  function handleOpenCreate() {
    setModalMode("create");
    setFormAlunoId(alunos[0]?.id || "");
    setFormCursoId(cursos[0]?.id || "");
    setFormStatus("ATIVA");
    setFormError("");
  }

  function handleOpenEdit(inscricao: Inscricao) {
    setModalMode(inscricao);
    setFormAlunoId(inscricao.alunoId);
    setFormCursoId(inscricao.cursoId);
    setFormStatus(inscricao.status);
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
        await api.post("/inscricoes", {
          alunoId: formAlunoId,
          cursoId: formCursoId,
          status: formStatus,
        });
      } else if (typeof modalMode === "object" && modalMode !== null) {
        await api.put(`/inscricoes/${modalMode.id}`, {
          status: formStatus,
        });
      }

      handleCloseModal();
      loadInscricoes();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Deseja realmente cancelar/remover esta inscrição?")) {
      return;
    }

    try {
      await api.delete(`/inscricoes/${id}`);
      loadInscricoes();
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  }

  // Busca textual client-side com .filter()
  const filteredInscricoes = inscricoes.filter((inscricao) => {
    const term = search.toLowerCase();
    return (
      inscricao.aluno.usuario.nome.toLowerCase().includes(term) ||
      inscricao.aluno.matricula.toLowerCase().includes(term) ||
      inscricao.curso.titulo.toLowerCase().includes(term) ||
      inscricao.status.toLowerCase().includes(term)
    );
  });

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
              <Plus size={16} /> Nova Inscrição
            </button>
          )}
        </div>

        <p className="eyebrow">MATRÍCULAS E ENGAGEMENT</p>
        <h1>Inscrições</h1>
        <p className="workspace-intro">
          Acompanhe as inscrições dos alunos nos cursos da plataforma.
        </p>

        {/* Busca Textual */}
        <div
          style={{
            position: "relative",
            margin: "20px 0 24px",
            maxWidth: "420px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "12px",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno, matrícula ou curso..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "10px",
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              outline: "none",
            }}
          />
        </div>

        {loading ? (
          <p className="student-list-message">Carregando inscrições...</p>
        ) : error ? (
          <p className="student-list-message student-list-error">{error}</p>
        ) : filteredInscricoes.length === 0 ? (
          <p className="student-list-message">Nenhuma inscrição encontrada.</p>
        ) : (
          <ul className="student-list">
            {filteredInscricoes.map((insc) => {
              const statusStyle = statusColors[insc.status] || {
                bg: "#334155",
                text: "#fff",
              };

              return (
                <li
                  className="student-card"
                  key={insc.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "1.05rem" }}>
                        {insc.aluno.usuario.nome}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 600,
                        }}
                      >
                        {insc.status}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 6px",
                        color: "#cbd5e1",
                        fontSize: "0.875rem",
                      }}
                    >
                      Curso:{" "}
                      <strong style={{ color: "#a5b4fc" }}>
                        {insc.curso.titulo}
                      </strong>
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                      }}
                    >
                      <span>Matrícula: {insc.aluno.matricula}</span>
                      <span>
                        Data:{" "}
                        {new Date(insc.dataMatricula).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
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
                        onClick={() => handleOpenEdit(insc)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "6px",
                        }}
                        title="Alterar Status"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(insc.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#f43f5e",
                          cursor: "pointer",
                          padding: "6px",
                        }}
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modal único de Criar/Editar Inscrição com Selects Dinâmicos */}
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
                  ? "Nova Inscrição de Aluno"
                  : "Alterar Inscrição"}
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
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {modalMode === "create" && (
                <>
                  {/* SELECT DINÂMICO DE ALUNOS (Exigência da Etapa 6) */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "0.875rem",
                        color: "#cbd5e1",
                      }}
                    >
                      Aluno:
                    </label>
                    <select
                      value={formAlunoId}
                      onChange={(e) => setFormAlunoId(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid #334155",
                      }}
                    >
                      {alunos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.usuario.nome} ({a.matricula})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT DINÂMICO DE CURSOS (Exigência da Etapa 6) */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "0.875rem",
                        color: "#cbd5e1",
                      }}
                    >
                      Curso:
                    </label>
                    <select
                      value={formCursoId}
                      onChange={(e) => setFormCursoId(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid #334155",
                      }}
                    >
                      {cursos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.titulo} ({c.cargaHoraria}h)
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Status da Inscrição */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Status:
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                  }}
                >
                  <option value="ATIVA">ATIVA</option>
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="CONCLUIDA">CONCLUÍDA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
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
                  {isSubmitting ? "Salvando..." : "Salvar Inscrição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
