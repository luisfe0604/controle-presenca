import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { supabase } from "../src/services/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);

      setLoading(false);
    }

    checkAuth();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
