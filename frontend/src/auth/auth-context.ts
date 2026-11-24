import { createContext } from "react";

import type { AuthSession } from "./session";

export interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
