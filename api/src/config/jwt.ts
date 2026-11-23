import { RoleUsuarioEnum, type RoleUsuario } from "@projeto/shared";
import jwt from "jsonwebtoken";
import { z } from "zod";

const jwtConfigSchema = z.object({
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve conter pelo menos 32 caracteres."),
  JWT_EXPIRES_IN: z.enum(["15m", "1h", "1d", "7d"]).default("1d"),
});

export interface AuthenticatedUser {
  id: string;
  role: RoleUsuario;
}

function getJwtConfig() {
  return jwtConfigSchema.parse({
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  });
}

export function validateJwtConfig(): void {
  getJwtConfig();
}

export function createAuthToken(user: AuthenticatedUser): string {
  const config = getJwtConfig();

  return jwt.sign(
    { role: user.role },
    config.JWT_SECRET,
    { subject: user.id, expiresIn: config.JWT_EXPIRES_IN },
  );
}

export function verifyAuthToken(token: string): AuthenticatedUser | null {
  const { JWT_SECRET } = getJwtConfig();

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload === "string" || !payload.sub) {
      return null;
    }

    const role = RoleUsuarioEnum.safeParse(payload.role);
    if (!role.success) {
      return null;
    }

    return { id: payload.sub, role: role.data };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return null;
    }

    throw error;
  }
}
