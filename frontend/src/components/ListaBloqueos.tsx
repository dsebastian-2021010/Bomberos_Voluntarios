import { useMemo, useState } from 'react';
import { NumeroBloqueado } from '../services/bloqueos';

interface ListaBloqueosProps {
  bloqueos: NumeroBloqueado[];
  cargando: boolean;
}

function tiempoRestante(fechaExpiracion: string): string {
  const ms = new Date(fechaExpiracion).getTime() - Date.now();
  if (ms <= 0) return 'Expirado';
  const horas = Math.floor(ms / (1000 * 60 * 60));
  const minutos = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${horas}h ${minutos}m restantes`;
}

export default function ListaBloqueos({ bloqueos, cargando }: ListaBloqueosProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return bloqueos;
    return bloqueos.filter((b) => b.numero_telefono.includes(q));
  }, [bloqueos, busqueda]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-bold text-ink-900">
          Números bloqueados <span className="text-ink-400">({filtrados.length})</span>
        </h2>
        <input
          type="text"
          placeholder="Buscar por número..."
          className="input-field sm:w-72"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-ink-400">Cargando bloqueos...</p>
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400">No hay números bloqueados todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 pr-4">Teléfono</th>
                <th className="py-2 pr-4">Razón</th>
                <th className="py-2 pr-4">Reportado por</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Sincronización</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((b) => (
                <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                  <td className="py-2.5 pr-4 font-semibold text-ink-900">{b.numero_telefono}</td>
                  <td className="py-2.5 pr-4 max-w-xs text-ink-600">{b.razon}</td>
                  <td className="py-2.5 pr-4 text-ink-600">{b.reportado_por}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.vigente ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {b.vigente ? tiempoRestante(b.fecha_expiracion) : 'Expirado'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        b.sincronizado_externo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gold-500/20 text-gold-600'
                      }`}
                      title={b.error_sincronizacion || undefined}
                    >
                      {b.sincronizado_externo ? 'Sincronizado' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
