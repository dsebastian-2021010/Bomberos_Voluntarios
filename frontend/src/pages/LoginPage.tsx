import { FormEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { obtenerMensajeError } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await iniciarSesion(email, password);
      const destino = (location.state as { from?: string })?.from || '/dashboard';
      navigate(destino, { replace: true });
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="bg-black py-1 text-center text-xs font-semibold tracking-wide text-white">
        PARA INFORMAR DE UNA EMERGENCIA POR FAVOR LLAMAR AL <span className="text-brand-400">122</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-xl font-black text-ink-900 shadow-md">
              CVB
            </span>
            <h1 className="mt-4 text-center text-xl font-bold text-ink-900">Bomberos Voluntarios</h1>
            <p className="text-center text-sm text-ink-400">Sistema de Gestión de Contactos</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Correo electrónico</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Contraseña</label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
                {error}
              </p>
            )}

            <button type="submit" disabled={cargando} className="btn-primary w-full">
              {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-400">
            Acceso exclusivo para personal autorizado del Cuerpo Voluntario de Bomberos.
          </p>
        </div>
      </div>
    </div>
  );
}
