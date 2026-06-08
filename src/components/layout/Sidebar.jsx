import { NavLink, useNavigate } from "react-router-dom";

import { supabase } from "../../services/supabase";

import "./layout.css";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate("/login");
  }
  function fecharSidebar() {
    setOpen(false);
  }

  return (
    <>
      {open && <div className="backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">🏐 Vôlei</div>

        <nav>
          <NavLink to="/" onClick={fecharSidebar}>Dashboard</NavLink>

          <NavLink to="/alunos" onClick={fecharSidebar}>Alunos</NavLink>

          <NavLink to="/presencas" onClick={fecharSidebar}>Presenças</NavLink>

          <NavLink to="/pagamentos" onClick={fecharSidebar}>Pagamentos</NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </aside>
    </>
  );
}
