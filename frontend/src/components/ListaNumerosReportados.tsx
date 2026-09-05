import { useMemo, useState } from 'react';
import { NumeroReportado } from '../services/llamadas';

interface ListaNumerosReportadosProps {
  numeros: NumeroReportado[];
  cargando: boolean;
  onBloquear: (id: number) => void;
  onDesbloquear: (id: number) => void;
  onVerHistorial: (id: number) => void;
}

export default function ListaNumerosReportados({
  numeros,
  cargando,
  onBloquear,
  onDesbloquear,
  onVerHistorial,
}: ListaNumerosReportadosProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return numeros;
    return numeros.filter((n) => n.numero_telefono.includes(q));
  }, [numeros, busqueda]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-bold text-ink-900">
          Números reportados <span className="text-ink-400">({filtrados.length})</span>
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
        <p className="py-8 text-center text-sm text-ink-400">Cargando números...</p>
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400">No hay números reportados todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 pr-4">Teléfono</th>
                <th className="py-2 pr-4">Reportes</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Último reporte</th>
                <th className="py-2 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((n) => (
                <tr key={n.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                  <td className="py-2.5 pr-4 font-semibold text-ink-900">{n.numero_telefono}</td>
                  <td className="py-2.5 pr-4 text-ink-600">{n.total_reportes}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        n.bloqueado ? 'bg-brand-50 text-brand-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {n.bloqueado ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-400">
                    {new Date(n.fecha_ultimo_reporte).toLocaleDateString('es-GT')}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onVerHistorial(n.id)}
                        className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
                      >
                        Historial
                      </button>
                      {n.bloqueado ? (
                        <button
                          onClick={() => onDesbloquear(n.id)}
                          className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <button onClick={() => onBloquear(n.id)} className="btn-danger">
                          Bloquear
                        </button>
                      )}
                    </div>
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
