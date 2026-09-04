import { FormEvent, useState } from 'react';
import * as authService from '../services/auth';
import { obtenerMensajeError } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

export default function PerfilPage() {
  const { usuario } = useAuth();
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (passwordNueva !== confirmar) {
      setToast({ mensaje: 'Las contraseñas nuevas no coinciden', tipo: 'error' });
      return;
    }

    setEnviando(true);
    try {
      await authService.cambiarPassword(passwordActual, passwordNueva);
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmar('');
      setToast({ mensaje: 'Contraseña actualizada correctamente', tipo: 'exito' });
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Mi Perfil</h1>
        <p className="text-sm text-ink-400">
          {usuario?.nombre} · {usuario?.email} · <span className="capitalize">{usuario?.rol}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h2 className="text-base font-bold text-ink-900">Cambiar contraseña</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Contraseña actual</label>
          <input
            type="password"
            required
            className="input-field"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Nueva contraseña</label>
          <input
            type="password"
            required
            className="input-field"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink-400">
            Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Confirmar nueva contraseña</label>
          <input
            type="password"
            required
            className="input-field"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
        </div>
        <button type="submit" disabled={enviando} className="btn-primary w-full">
          {enviando ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
