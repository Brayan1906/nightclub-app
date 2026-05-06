import { useState } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Users, Lock, User } from 'lucide-react';
import { supabase } from "../client";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-368d155e`;

interface LoginViewProps {
  onLogin: (user: any, token: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 'mesero', name: 'Mesero', icon: Users, color: 'bg-blue-500', description: 'Gestión de mesas y pedidos' },
    { id: 'barra', name: 'Barra', icon: User, color: 'bg-green-500', description: 'Preparación de pedidos' },
    { id: 'admin', name: 'Administrador', icon: Lock, color: 'bg-purple-500', description: 'Gestión completa' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("role", selectedRole);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Credenciales incorrectas");
      }

      onLogin(data[0], "fake-token");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================== SELECCIÓN DE ROL ==================
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center px-4">
        
        <div className="w-full max-w-6xl">
          
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Johny’s NightClub
            </h1>
            <p className="text-gray-300 mt-3 text-base md:text-lg">
              Sistema de gestión inteligente
            </p>
          </div>

          {/* ROLES */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="group bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 hover:bg-white/20 transition-all duration-300 shadow-xl"
                >
                  <div className={`${role.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-1">
                    {role.name}
                  </h3>

                  <p className="text-gray-300 text-sm">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ================== LOGIN ==================
  const currentRole = roles.find(r => r.id === selectedRole);
  const Icon = currentRole?.icon || Users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center px-4">

      <div className="w-full max-w-md">
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">

          <button
            onClick={() => setSelectedRole(null)}
            className="text-gray-300 hover:text-white mb-6 text-sm"
          >
            ← Cambiar rol
          </button>

          <div className="flex flex-col items-center">
            <div className={`${currentRole?.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              {currentRole?.name}
            </h2>

            <p className="text-gray-300 text-sm mb-6 text-center">
              {currentRole?.description}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${currentRole?.color} py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all duration-200 disabled:opacity-50`}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}