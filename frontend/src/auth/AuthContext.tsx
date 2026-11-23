import { useState, type ReactNode } from "react";

import { AuthContext } from "./auth-context";
import {
  clearSession,
  readSession,
  storeSession,
  type AuthSession,
} from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setCurrentSession] = useState<AuthSession | null>(() =>
    readSession(),
  );

  function setSession(nextSession: AuthSession | null): void {
    if (nextSession) {
      storeSession(nextSession);
    } else {
      clearSession();
    }

    setCurrentSession(nextSession);
  }

  function logout(): void {
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
