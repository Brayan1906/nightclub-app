import { useState } from "react";
import LoginView from "./components/LoginView";
import WaiterView from "./components/WaiterView";
import BarView from "./components/BarView";
import AdminView from "./components/AdminView";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  // 🔥 SIN CONTENEDOR EXTRA (AQUÍ ESTABA EL ERROR)
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Según rol
  return (
    <div className="w-full min-h-screen">
      {user.role === "mesero" && (
        <WaiterView
          user={user}
          token={token}
          onLogout={handleLogout}
        />
      )}

      {user.role === "barra" && (
        <BarView
          user={user}
          token={token}
          onLogout={handleLogout}
        />
      )}

      {user.role === "admin" && (
        <AdminView
          user={user}
          token={token}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}