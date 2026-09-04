import { useMemo, useState } from 'react';
import { Numero } from '../services/numeros';

interface ListaNumerosProps {
  numeros: Numero[];
  cargando: boolean;
  onEliminar: (id: number) => void;
  mostrarPropietarioColumna?: boolean;
}

export default function ListaNumeros({ numeros, cargando, onEliminar }: ListaNumerosProps) {
  const [busqueda, setBusqueda] = useState('');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return numeros;
    return numeros.filter(
      (n) =>
        n.numero_telefono.includes(q) ||
        n.nombre_propietario?.toLowerCase().includes(q) ||
        n.descripcion?.toLowerCase().includes(q)
    );
  }, [numeros, busqueda]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-bold text-ink-900">
          Números registrados <span className="text-ink-400">({filtrados.length})</span>
        </h2>
        <input
          type="text"
          placeholder="Buscar por número, nombre o descripción..."
          className="input-field sm:w-72"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-ink-400">Cargando números...</p>
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-400">No hay números registrados todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                <th className="py-2 pr-4">Teléfono</th>
                <th className="py-2 pr-4">Propietario</th>
                <th className="py-2 pr-4">Descripción</th>
                <th className="py-2 pr-4">Registrado por</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((n) => (
                <tr key={n.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                  <td className="py-2.5 pr-4 font-semibold text-ink-900">{n.numero_telefono}</td>
                  <td className="py-2.5 pr-4 text-ink-600">{n.nombre_propietario || '-'}</td>
                  <td className="py-2.5 pr-4 text-ink-600">{n.descripcion || '-'}</td>
                  <td className="py-2.5 pr-4 text-ink-600">{n.creado_por || '-'}</td>
                  <td className="py-2.5 pr-4 text-ink-400">
                    {new Date(n.fecha_creacion).toLocaleDateString('es-GT')}
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    <button onClick={() => onEliminar(n.id)} className="btn-danger">
                      Eliminar
                    </button>
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
