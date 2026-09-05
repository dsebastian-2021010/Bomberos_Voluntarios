import { FormEvent, useState } from 'react';
import * as llamadasService from '../services/llamadas';
import { MOTIVOS, Motivo } from '../services/llamadas';
import { obtenerMensajeError } from '../services/api';

interface RegistrarLlamadaProps {
  onRegistrado: () => void;
  onError: (mensaje: string) => void;
  onExito: (mensaje: string) => void;
}

export default function RegistrarLlamada({ onRegistrado, onError, onExito }: RegistrarLlamadaProps) {
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [motivo, setMotivo] = useState<Motivo>('broma');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await llamadasService.reportarLlamada({
        numeroTelefono: numeroTelefono.replace(/\D/g, ''),
        motivo,
        descripcion: descripcion || undefined,
      });
      setNumeroTelefono('');
      setMotivo('broma');
      setDescripcion('');
      onExito('Llamada registrada correctamente.');
      onRegistrado();
    } catch (err) {
      onError(obtenerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="text-base font-bold text-ink-900">Registrar llamada falsa / broma</h2>
      <div className="grid gap-4 sm:grid-cols-3">
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
          <label className="mb-1 block text-sm font-medium text-ink-700">Motivo *</label>
          <select
            required
            className="input-field"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value as Motivo)}
          >
            {MOTIVOS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Descripción</label>
          <input
            type="text"
            className="input-field"
            placeholder="Detalles de la llamada"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" disabled={enviando} className="btn-primary">
        {enviando ? 'Registrando...' : '+ Registrar llamada'}
      </button>
    </form>
  );
}
