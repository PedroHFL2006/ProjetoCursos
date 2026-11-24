import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { registerFormSchema } from "../schemas/auth";
import { api, getApiErrorMessage } from "../services/api";
import { BrandLogo } from "../components/BrandLogo";

interface FieldErrors {
  nome?: string;
  email?: string;
  senha?: string;
}

export function RegisterPage() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const result = registerFormSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          (field === "nome" || field === "email" || field === "senha") &&
          !nextErrors[field]
        ) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post<{ message: string }>(
        "/auth/register",
        result.data,
      );
      setFeedback({ type: "success", message: response.data.message });
      setForm({ nome: "", email: "", senha: "" });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page relative isolate grid min-h-screen place-items-center overflow-hidden">
      <section
        className="auth-card w-full max-w-[420px] rounded-2xl border border-white/10 p-8 backdrop-blur-xl"
        aria-labelledby="register-title"
      >
        <div className="auth-heading">
          <BrandLogo className="auth-logo" />
          <h1 id="register-title">Registrar-se</h1>
          <p>Crie sua conta para acessar a plataforma de cursos livres.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            <span>Name*</span>
            <input
              autoComplete="name"
              name="nome"
              placeholder="Enter your name."
              value={form.nome}
              onChange={(event) =>
                setForm((current) => ({ ...current, nome: event.target.value }))
              }
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? "name-error" : undefined}
            />
            {errors.nome && <small id="name-error">{errors.nome}</small>}
          </label>

          <label className="form-field">
            <span>Email*</span>
            <input
              autoComplete="email"
              name="email"
              type="email"
              placeholder="Enter your email."
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <small id="email-error">{errors.email}</small>}
          </label>

          <label className="form-field">
            <span>Password*</span>
            <input
              autoComplete="new-password"
              name="senha"
              type="password"
              placeholder="Create a password."
              value={form.senha}
              onChange={(event) =>
                setForm((current) => ({ ...current, senha: event.target.value }))
              }
              aria-invalid={Boolean(errors.senha)}
              aria-describedby="password-hint"
            />
            <small id="password-hint">
              {errors.senha ?? "Must be at least 8 characters."}
            </small>
          </label>

          {feedback && (
            <p
              className={`form-message${feedback.type === "error" ? " form-message-error" : ""}`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}

          <button
            className="primary-button h-10 w-full rounded-lg transition-all"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
            {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>
        <p className="auth-footer">
          Jate tem uma conta? <Link to="/login">Entrar aqui</Link>
        </p>
      </section>
    </main>
  );
}
