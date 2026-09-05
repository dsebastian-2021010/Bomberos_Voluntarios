import { useEffect, useState, useCallback } from 'react';
import RegistrarLlamada from '../components/RegistrarLlamada';
import ListaNumerosReportados from '../components/ListaNumerosReportados';
import HistorialModal from '../components/HistorialModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import * as llamadasService from '../services/llamadas';
import { NumeroReportado } from '../services/llamadas';
import { obtenerMensajeError } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [numeros, setNumeros] = useState<NumeroReportado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aBloquear, setABloquear] = useState<number | null>(null);
  const [historialId, setHistorialId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const cargarNumeros = useCallback(async () => {
    setCargando(true);
    try {
      const data = await llamadasService.listarNumeros();
      setNumeros(data);
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNumeros();
  }, [cargarNumeros]);

  async function confirmarBloquear() {
    if (aBloquear == null) return;
    try {
      await llamadasService.bloquearNumero(aBloquear);
      setToast({ mensaje: 'Número bloqueado correctamente. Se notificó por correo.', tipo: 'exito' });
      cargarNumeros();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setABloquear(null);
    }
  }

  async function handleDesbloquear(id: number) {
    try {
      await llamadasService.desbloquearNumero(id);
      setToast({ mensaje: 'Número desbloqueado correctamente.', tipo: 'exito' });
      cargarNumeros();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Bienvenido, {usuario?.nombre?.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-400">
          Registro y bloqueo de números que reportan llamadas falsas o de broma.
        </p>
      </div>

      <RegistrarLlamada
        onRegistrado={cargarNumeros}
        onExito={(m) => setToast({ mensaje: m, tipo: 'exito' })}
        onError={(m) => setToast({ mensaje: m, tipo: 'error' })}
      />

      <ListaNumerosReportados
        numeros={numeros}
        cargando={cargando}
        onBloquear={(id) => setABloquear(id)}
        onDesbloquear={handleDesbloquear}
        onVerHistorial={(id) => setHistorialId(id)}
      />

      {aBloquear != null && (
        <ConfirmModal
          titulo="Bloquear número"
          mensaje="¿Estás seguro de que deseas bloquear este número? Quedará marcado como reincidente en llamadas falsas."
          onConfirmar={confirmarBloquear}
          onCancelar={() => setABloquear(null)}
        />
      )}

      {historialId != null && (
        <HistorialModal numeroId={historialId} onCerrar={() => setHistorialId(null)} />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
