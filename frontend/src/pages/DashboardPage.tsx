import { useEffect, useState, useCallback } from 'react';
import BloquearNumero from '../components/BloquearNumero';
import ListaBloqueos from '../components/ListaBloqueos';
import Toast from '../components/Toast';
import * as bloqueosService from '../services/bloqueos';
import { NumeroBloqueado } from '../services/bloqueos';
import { obtenerMensajeError } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [bloqueos, setBloqueos] = useState<NumeroBloqueado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const cargarBloqueos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await bloqueosService.listarBloqueos();
      setBloqueos(data);
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarBloqueos();
  }, [cargarBloqueos]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Bienvenido, {usuario?.nombre?.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-400">
          Registra un número reportado por llamada falsa o de broma para bloquearlo por 48 horas.
        </p>
      </div>

      <BloquearNumero
        onRegistrado={cargarBloqueos}
        onExito={(m) => setToast({ mensaje: m, tipo: 'exito' })}
        onError={(m) => setToast({ mensaje: m, tipo: 'error' })}
      />

      <ListaBloqueos bloqueos={bloqueos} cargando={cargando} />

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
