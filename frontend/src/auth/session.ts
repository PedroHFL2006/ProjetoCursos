import { RoleUsuarioEnum } from "@projeto/shared";
import { z } from "zod";

const userSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string().email(),
  role: RoleUsuarioEnum,
});

const sessionSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
});

export type AuthUser = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof sessionSchema>;

const sessionKey = "projeto-cursos:session";

export function readSession(): AuthSession | null {
  const storedValue = sessionStorage.getItem(sessionKey);
  if (!storedValue) return null;

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch {
    sessionStorage.removeItem(sessionKey);
    return null;
  }

  const result = sessionSchema.safeParse(parsedValue);
  if (!result.success) {
    sessionStorage.removeItem(sessionKey);
    return null;
  }

  return result.data;
}

export function storeSession(session: AuthSession): void {
  sessionStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(sessionKey);
}
