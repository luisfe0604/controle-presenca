import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../services/supabase";

import "./layout.css";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate("/login");
  }

  return (
    <>
      {open && <div className="backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">🏐 Vôlei</div>

        <nav>
          <NavLink to="/" onClick={onClose}>
            Dashboard
          </NavLink>

          <NavLink to="/alunos" onClick={onClose}>
            Alunos
          </NavLink>

          <NavLink to="/presencas" onClick={onClose}>
            Presenças
          </NavLink>

          <NavLink to="/pagamentos" onClick={onClose}>
            Pagamentos
          </NavLink>

          <a
            className="external"
            href="https://score-pink.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Placar
          </a>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </aside>
    </>
  );
}
