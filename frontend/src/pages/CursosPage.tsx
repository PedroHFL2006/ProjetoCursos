import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  DollarSign,
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { api, getApiErrorMessage } from "../services/api";

interface ProfessorOption {
  id: string;
  especialidade: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
}

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  cargaHoraria: number;
  preco: number | string;
  publicado: boolean;
  professorId: string;
  professor: {
    id: string;
    especialidade: string;
    usuario: {
      id: string;
      nome: string;
      email: string;
    };
  };
}

export function CursosPage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "ADMIN";

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [professores, setProfessores] = useState<ProfessorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Estado do Modal (null = fechado; "create" = novo; Curso = editando)
  const [modalMode, setModalMode] = useState<"create" | Curso | null>(null);
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formCargaHoraria, setFormCargaHoraria] = useState(40);
  const [formPreco, setFormPreco] = useState(99.9);
  const [formProfessorId, setFormProfessorId] = useState("");
  const [formPublicado, setFormPublicado] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadCursos() {
    setLoading(true);
    api
      .get<{ cursos: Curso[] }>("/cursos")
      .then(({ data }) => setCursos(data.cursos))
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCursos();

    // Carrega a lista de professores para o select do modal
    api
      .get<{ professores: ProfessorOption[] }>("/professores")
      .then(({ data }) => setProfessores(data.professores))
      .catch(() => {});
  }, []);

  function handleOpenCreate() {
    setModalMode("create");
    setFormTitulo("");
    setFormDescricao("");
    setFormCargaHoraria(40);
    setFormPreco(99.9);
    setFormProfessorId(professores[0]?.id || "");
    setFormPublicado(true);
    setFormError("");
  }

  function handleOpenEdit(curso: Curso) {
    setModalMode(curso);
    setFormTitulo(curso.titulo);
    setFormDescricao(curso.descricao);
    setFormCargaHoraria(curso.cargaHoraria);
    setFormPreco(Number(curso.preco));
    setFormProfessorId(curso.professorId);
    setFormPublicado(curso.publicado);
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
        await api.post("/cursos", {
          titulo: formTitulo,
          descricao: formDescricao,
          cargaHoraria: Number(formCargaHoraria),
          preco: Number(formPreco),
          professorId: formProfessorId,
          publicado: formPublicado,
        });
      } else if (typeof modalMode === "object" && modalMode !== null) {
        await api.put(`/cursos/${modalMode.id}`, {
          titulo: formTitulo,
          descricao: formDescricao,
          cargaHoraria: Number(formCargaHoraria),
          preco: Number(formPreco),
          professorId: formProfessorId,
          publicado: formPublicado,
        });
      }

      handleCloseModal();
      loadCursos();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string, titulo: string) {
    if (!window.confirm(`Deseja realmente excluir o curso "${titulo}"?`)) {
      return;
    }

    try {
      await api.delete(`/cursos/${id}`);
      loadCursos();
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  }

  // Busca textual client-side com .filter() exigida na Etapa 6
  const filteredCursos = cursos.filter((curso) => {
    const term = search.toLowerCase();
    return (
      curso.titulo.toLowerCase().includes(term) ||
      curso.descricao.toLowerCase().includes(term) ||
      curso.professor.usuario.nome.toLowerCase().includes(term) ||
      curso.professor.especialidade.toLowerCase().includes(term)
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
              <Plus size={16} /> Novo Curso
            </button>
          )}
        </div>

        <p className="eyebrow">CATÁLOGO ACADÊMICO</p>
        <h1>Cursos</h1>
        <p className="workspace-intro">
          Explore e gerencie os cursos oferecidos na plataforma.
        </p>

        {/* Barra de Busca Textual Client-Side com .filter() */}
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
            placeholder="Buscar por título, descrição ou professor..."
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
          <p className="student-list-message">Carregando cursos...</p>
        ) : error ? (
          <p className="student-list-message student-list-error">{error}</p>
        ) : filteredCursos.length === 0 ? (
          <p className="student-list-message">Nenhum curso encontrado.</p>
        ) : (
          <ul className="student-list">
            {filteredCursos.map((curso) => (
              <li
                className="student-card"
                key={curso.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "flex", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(99,102,241,0.15)",
                      color: "#818cf8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <strong style={{ fontSize: "1.05rem" }}>
                        {curso.titulo}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          background: curso.publicado
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(234,179,8,0.15)",
                          color: curso.publicado ? "#4ade80" : "#facc15",
                          fontWeight: 500,
                        }}
                      >
                        {curso.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "6px 0 10px",
                        color: "#94a3b8",
                        fontSize: "0.875rem",
                      }}
                    >
                      {curso.descricao}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        fontSize: "0.825rem",
                        color: "#cbd5e1",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Clock size={14} style={{ color: "#64748b" }} />{" "}
                        {curso.cargaHoraria}h de duração
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <DollarSign size={14} style={{ color: "#22c55e" }} /> R${" "}
                        {Number(curso.preco).toFixed(2)}
                      </span>
                      <span>
                        Instrutor:{" "}
                        <strong style={{ color: "#a5b4fc" }}>
                          {curso.professor.usuario.nome}
                        </strong>{" "}
                        ({curso.professor.especialidade})
                      </span>
                    </div>
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
                      onClick={() => handleOpenEdit(curso)}
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
                      onClick={() => handleDelete(curso.id, curso.titulo)}
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

      {/* Modal único de Criar/Editar Curso com Select Dinâmico de Professores */}
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
              maxWidth: "520px",
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
                {modalMode === "create" ? "Criar Novo Curso" : "Editar Curso"}
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
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Título:
                </label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Introdução ao React..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
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
                    marginBottom: "4px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Descrição:
                </label>
                <textarea
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Conteúdo programático e objetivos do curso..."
                  rows={3}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
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
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                      color: "#cbd5e1",
                    }}
                  >
                    Carga Horária (horas):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formCargaHoraria}
                    onChange={(e) =>
                      setFormCargaHoraria(Number(e.target.value))
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
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
                      marginBottom: "4px",
                      fontSize: "0.875rem",
                      color: "#cbd5e1",
                    }}
                  >
                    Preço (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPreco}
                    onChange={(e) => setFormPreco(Number(e.target.value))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "#0f172a",
                      color: "#f8fafc",
                      border: "1px solid #334155",
                    }}
                  />
                </div>
              </div>

              {/* SELECT DINÂMICO DE PROFESSORES (Exigência da Etapa 6: nunca digitar ID) */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                  }}
                >
                  Professor Responsável:
                </label>
                <select
                  value={formProfessorId}
                  onChange={(e) => setFormProfessorId(e.target.value)}
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
                  {professores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.usuario.nome} — {prof.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <input
                  type="checkbox"
                  id="chkPublicado"
                  checked={formPublicado}
                  onChange={(e) => setFormPublicado(e.target.checked)}
                />
                <label
                  htmlFor="chkPublicado"
                  style={{
                    fontSize: "0.875rem",
                    color: "#cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  Publicar curso imediatamente para os alunos
                </label>
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
                  {isSubmitting ? "Salvando..." : "Salvar Curso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
