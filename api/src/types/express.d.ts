import type { RoleUsuario } from "@projeto/shared";

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: {
        id: string;
        role: RoleUsuario;
      };
    }
  }
}

export {};
