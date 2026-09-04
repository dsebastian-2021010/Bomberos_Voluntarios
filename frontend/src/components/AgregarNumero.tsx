import { FormEvent, useState } from 'react';
import * as numerosService from '../services/numeros';
import { obtenerMensajeError } from '../services/api';

interface AgregarNumeroProps {
  onCreado: () => void;
  onError: (mensaje: string) => void;
  onExito: (mensaje: string) => void;
}

export default function AgregarNumero({ onCreado, onError, onExito }: AgregarNumeroProps) {
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [nombrePropietario, setNombrePropietario] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await numerosService.crearNumero({
        numeroTelefono: numeroTelefono.replace(/\D/g, ''),
        nombrePropietario: nombrePropietario || undefined,
        descripcion: descripcion || undefined,
      });
      setNumeroTelefono('');
      setNombrePropietario('');
      setDescripcion('');
      onExito('Número agregado correctamente. Se notificó por correo.');
      onCreado();
    } catch (err) {
      onError(obtenerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5">
      <h2 className="text-base font-bold text-ink-900">Agregar número de contacto</h2>
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
          <label className="mb-1 block text-sm font-medium text-ink-700">Propietario</label>
          <input
            type="text"
            className="input-field"
            placeholder="Nombre completo"
            value={nombrePropietario}
            onChange={(e) => setNombrePropietario(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Descripción</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ej. Motorista turno matutino"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" disabled={enviando} className="btn-primary">
        {enviando ? 'Guardando...' : '+ Agregar número'}
      </button>
    </form>
  );
}
