import { Routes, Route, HashRouter } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Presencas from "./pages/Presencas";
import Pagamentos from "./pages/Pagamentos";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "../routes/ProtectedRoute";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />

          <Route path="/alunos" element={<Alunos />} />

          <Route path="/presencas" element={<Presencas />} />

          <Route path="/pagamentos" element={<Pagamentos />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
