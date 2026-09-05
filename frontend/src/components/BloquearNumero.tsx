import { FormEvent, useState } from 'react';
import * as bloqueosService from '../services/bloqueos';
import { obtenerMensajeError } from '../services/api';

interface BloquearNumeroProps {
  onRegistrado: () => void;
  onError: (mensaje: string) => void;
  onExito: (mensaje: string) => void;
}

export default function BloquearNumero({ onRegistrado, onError, onExito }: BloquearNumeroProps) {
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [razon, setRazon] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await bloqueosService.crearBloqueo({
        numeroTelefono: numeroTelefono.replace(/\D/g, ''),
        razon: razon.trim(),
      });
      setNumeroTelefono('');
      setRazon('');
      onExito('Número bloqueado por 48 horas. Se notificó al SuperAdmin por correo.');
      onRegistrado();
    } catch (err) {
      onError(obtenerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="text-base font-bold text-ink-900">Bloquear número por llamada de broma</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Número de teléfono *</label>
          <input
            type="tel"
            required
            className="input-field"
            placeholder="Ej. 55123456"
            value={numeroTelefono}
            onChange={(e) => setNumeroTelefono(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Razón *</label>
          <input
            type="text"
            required
            minLength={3}
            className="input-field"
            placeholder="Ej. Llamó reportando un incendio falso"
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" disabled={enviando} className="btn-primary">
        {enviando ? 'Bloqueando...' : '🚫 Bloquear por 48 horas'}
      </button>
    </form>
  );
}
