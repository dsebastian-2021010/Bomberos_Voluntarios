import { createContext, useEffect, useState, ReactNode } from 'react';
import * as authService from '../services/auth';
import { Usuario } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: (usuario: Usuario) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCargando(false);
      return;
    }

    authService
      .obtenerPerfil()
      .then((perfil) => setUsuario(perfil))
      .catch(() => {
        localStorage.clear();
      })
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(email: string, password: string) {
    const { accessToken, refreshToken, usuario: perfil } = await authService.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUsuario(perfil);
  }

  async function cerrarSesion() {
    await authService.logout();
    localStorage.clear();
    setUsuario(null);
  }

  function actualizarUsuario(nuevoUsuario: Usuario) {
    setUsuario(nuevoUsuario);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}
