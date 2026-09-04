import { FormEvent, useEffect, useState, useCallback } from 'react';
import * as usuariosService from '../services/usuarios';
import { Usuario } from '../services/auth';
import { obtenerMensajeError } from '../services/api';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import { useAuth } from '../hooks/useAuth';

const ROLES: Usuario['rol'][] = ['usuario', 'admin', 'superadmin'];

export default function GestionUsuarios() {
  const { usuario: usuarioActual } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [aEliminar, setAEliminar] = useState<number | null>(null);
  const [toast, setToast] = useState<{ mensaje: string; tipo: 'exito' | 'error' } | null>(null);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Usuario['rol']>('usuario');
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setUsuarios(await usuariosService.listarUsuarios());
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleCrear(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await usuariosService.crearUsuario({ nombre, email, rol });
      setNombre('');
      setEmail('');
      setRol('usuario');
      setToast({ mensaje: 'Usuario creado. Se envió la contraseña temporal por correo.', tipo: 'exito' });
      cargar();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarRol(id: number, nuevoRol: Usuario['rol']) {
    try {
      await usuariosService.actualizarUsuario(id, { rol: nuevoRol });
      setToast({ mensaje: 'Rol actualizado correctamente', tipo: 'exito' });
      cargar();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    }
  }

  async function cambiarEstado(id: number, estado: boolean) {
    try {
      await usuariosService.actualizarUsuario(id, { estado });
      cargar();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    }
  }

  async function confirmarEliminar() {
    if (aEliminar == null) return;
    try {
      await usuariosService.eliminarUsuario(aEliminar);
      setToast({ mensaje: 'Usuario eliminado correctamente', tipo: 'exito' });
      cargar();
    } catch (err) {
      setToast({ mensaje: obtenerMensajeError(err), tipo: 'error' });
    } finally {
      setAEliminar(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCrear} className="card space-y-4 p-5">
        <h2 className="text-base font-bold text-ink-900">Crear nuevo usuario</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Nombre completo *</label>
            <input
              required
              className="input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Correo electrónico *</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Rol *</label>
            <select
              className="input-field"
              value={rol}
              onChange={(e) => setRol(e.target.value as Usuario['rol'])}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={enviando} className="btn-primary">
          {enviando ? 'Creando...' : '+ Crear usuario'}
        </button>
      </form>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-bold text-ink-900">
          Usuarios registrados <span className="text-ink-400">({usuarios.length})</span>
        </h2>

        {cargando ? (
          <p className="py-8 text-center text-sm text-ink-400">Cargando usuarios...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2 pr-4">Nombre</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Rol</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50">
                    <td className="py-2.5 pr-4 font-semibold text-ink-900">{u.nombre}</td>
                    <td className="py-2.5 pr-4 text-ink-600">{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <select
                        className="rounded-md border border-ink-200 px-2 py-1 text-xs"
                        value={u.rol}
                        onChange={(e) => cambiarRol(u.id, e.target.value as Usuario['rol'])}
                        disabled={u.id === usuarioActual?.id}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 pr-4">
                      <button
                        onClick={() => cambiarEstado(u.id, !u.estado)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      <button
                        onClick={() => setAEliminar(u.id)}
                        disabled={u.id === usuarioActual?.id}
                        className="btn-danger disabled:opacity-40"
                      >
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

      {aEliminar != null && (
        <ConfirmModal
          titulo="Eliminar usuario"
          mensaje="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast(null)} />}
    </div>
  );
}
