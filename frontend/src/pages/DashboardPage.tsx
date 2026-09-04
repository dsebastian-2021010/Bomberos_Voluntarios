import { useEffect, useState, useCallback } from 'react';
import AgregarNumero from '../components/AgregarNumero';
import ListaNumeros from '../components/ListaNumeros';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import * as numerosService from '../services/numeros';
import { Numero } from '../services/numeros';
import { obtenerMensajeError } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [numeros, setNumeros] = useState<Numero[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState<number | null>(null);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const cargarNumeros = useCallback(async () => {
    setCargando(true);
    try {
      const data = await numerosService.listarNumeros();
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

  async function confirmarEliminar() {
    if (aEliminar == null) return;
    try {
      await numerosService.eliminarNumero(aEliminar);
      setToast({ mensaje: 'Número eliminado correctamente', tipo: 'exito' });
      cargarNumeros();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Bienvenido, {usuario?.nombre?.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink-400">
          {usuario?.rol === 'usuario'
            ? 'Aquí puedes gestionar tus números de contacto.'
            : 'Panel de control de números de contacto de la institución.'}
        </p>
      </div>

      <AgregarNumero
        onCreado={cargarNumeros}
        onExito={(m) => setToast({ mensaje: m, tipo: 'exito' })}
        onError={(m) => setToast({ mensaje: m, tipo: 'error' })}
      />

      <ListaNumeros numeros={numeros} cargando={cargando} onEliminar={(id) => setAEliminar(id)} />

      {aEliminar != null && (
        <ConfirmModal
          titulo="Eliminar número"
          mensaje="¿Estás seguro de que deseas eliminar este número de contacto? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
