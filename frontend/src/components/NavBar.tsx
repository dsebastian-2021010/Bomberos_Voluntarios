import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-brand-500 text-white' : 'text-ink-100 hover:bg-ink-700 hover:text-white'
  }`;

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function handleLogout() {
    await cerrarSesion();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20">
      <div className="bg-black py-1 text-center text-xs font-semibold tracking-wide text-white">
        PARA INFORMAR DE UNA EMERGENCIA POR FAVOR LLAMAR AL <span className="text-brand-400">122</span>
      </div>
      <nav className="bg-ink-800 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-lg font-black text-ink-900">
              CVB
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Bomberos Voluntarios</p>
              <p className="text-xs text-ink-200">Registro de Llamadas Falsas</p>
            </div>
          </div>

          <button
            className="text-white md:hidden"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={linkClase}>
              Llamadas
            </NavLink>
            {usuario?.rol === 'superadmin' && (
              <NavLink to="/usuarios" className={linkClase}>
                Usuarios
              </NavLink>
            )}
            <NavLink to="/perfil" className={linkClase}>
              Mi Perfil
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-2 rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {menuAbierto && (
          <div className="flex flex-col gap-1 border-t border-ink-700 bg-ink-800 px-4 py-3 md:hidden">
            <NavLink to="/dashboard" className={linkClase} onClick={() => setMenuAbierto(false)}>
              Números
            </NavLink>
            {usuario?.rol === 'superadmin' && (
              <NavLink to="/usuarios" className={linkClase} onClick={() => setMenuAbierto(false)}>
                Usuarios
              </NavLink>
            )}
            <NavLink to="/perfil" className={linkClase} onClick={() => setMenuAbierto(false)}>
              Mi Perfil
            </NavLink>
            <button
              onClick={handleLogout}
              className="mt-1 rounded-md bg-brand-500 px-3 py-2 text-left text-sm font-semibold text-white"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
