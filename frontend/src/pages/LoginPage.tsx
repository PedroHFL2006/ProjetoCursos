import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import type { AuthSession } from "../auth/session";
import { loginFormSchema } from "../schemas/auth";
import { api, getApiErrorMessage } from "../services/api";

interface LoginResponse extends AuthSession {
  message: string;
}

export function LoginPage() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const result = loginFormSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: { email?: string; senha?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "email" || field === "senha") && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", result.data);
      const { token, user } = response.data;
      setSession({ token, user });

      const state = location.state as { from?: { pathname?: string } } | null;
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page relative isolate grid min-h-screen place-items-center overflow-hidden">
      <section
        className="auth-card w-full max-w-[420px] rounded-2xl border border-white/10 p-8 backdrop-blur-xl"
        aria-labelledby="login-title"
      >
        <div className="auth-heading">
          <div className="brand-mark" aria-hidden="true"><LockKeyhole size={21} /></div>
          <h1 id="login-title">Welcome back</h1>
          <p>Entre na sua conta para continuar.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            {errors.email && (
              <small id="login-email-error">{errors.email}</small>
            )}
          </label>

          <label className="form-field">
            <span>Password*</span>
            <div className="password-input">
              <input
                autoComplete="current-password"
                name="senha"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password."
                value={form.senha}
                onChange={(event) =>
                  setForm((current) => ({ ...current, senha: event.target.value }))
                }
                aria-invalid={Boolean(errors.senha)}
                aria-describedby={errors.senha ? "login-password-error" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.senha && (
              <small id="login-password-error">{errors.senha}</small>
            )}
          </label>

          {message && (
            <p className="form-message form-message-error" role="alert">
              {message}
            </p>
          )}

          <button
            className="primary-button h-10 w-full rounded-lg transition-all"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
            {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
}
