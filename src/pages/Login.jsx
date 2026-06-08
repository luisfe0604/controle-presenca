import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../services/supabase";

import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro(error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🏐</span>

          <h1>Controle de Vôlei</h1>

          <p>Gestão de alunos, presenças e pagamentos</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Entrar</button>
        </form>

        {erro && <p className="error">{erro}</p>}
      </div>
    </div>
  );
}
