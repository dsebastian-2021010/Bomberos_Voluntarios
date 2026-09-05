import { useEffect, useState } from 'react';
import * as llamadasService from '../services/llamadas';
import { MOTIVOS, NumeroReportado, ReporteLlamada } from '../services/llamadas';
import { obtenerMensajeError } from '../services/api';

interface HistorialModalProps {
  numeroId: number;
  onCerrar: () => void;
}

export default function HistorialModal({ numeroId, onCerrar }: HistorialModalProps) {
  const [numero, setNumero] = useState<NumeroReportado | null>(null);
  const [reportes, setReportes] = useState<ReporteLlamada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    llamadasService
      .obtenerHistorial(numeroId)
      .then(({ numero, reportes }) => {
        setNumero(numero);
        setReportes(reportes);
      })
      .catch((err) => setError(obtenerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [numeroId]);

  function motivoLabel(motivo: string) {
    return MOTIVOS.find((m) => m.value === motivo)?.label || motivo;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-900">Historial de reportes</h3>
            {numero && <p className="text-sm text-ink-500">{numero.numero_telefono}</p>}
          </div>
          <button onClick={onCerrar} className="text-ink-400 hover:text-ink-700" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {cargando ? (
          <p className="py-6 text-center text-sm text-ink-400">Cargando historial...</p>
        ) : error ? (
          <p className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
            {error}
          </p>
        ) : (
          <ul className="space-y-3">
            {reportes.map((r) => (
              <li key={r.id} className="rounded-md border border-ink-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {motivoLabel(r.motivo)}
                  </span>
                  <span className="text-xs text-ink-400">
                    {new Date(r.fecha_hora).toLocaleString('es-GT')}
                  </span>
                </div>
                {r.descripcion && <p className="mt-2 text-sm text-ink-600">{r.descripcion}</p>}
                <p className="mt-1 text-xs text-ink-400">Registrado por {r.usuario_nombre}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
