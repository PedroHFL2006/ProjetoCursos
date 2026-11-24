import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { BrandLogo } from "./BrandLogo";

export function WorkspaceHeader() {
  const { logout } = useAuth();

  return (
    <header className="workspace-header">
      <Link className="workspace-brand" to="/">
        <BrandLogo className="workspace-logo" alt="" />
        <span>
          Cursos<span className="brand-accent">.</span>
        </span>
      </Link>
      <button className="logout-button" onClick={logout} type="button">
        <LogOut size={17} aria-hidden="true" />
        Sair
      </button>
    </header>
  );
}
