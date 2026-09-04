import { api } from './api';
import { Usuario } from './auth';

export async function listarUsuarios() {
  const { data } = await api.get('/usuarios');
  return data.data as Usuario[];
}

export async function crearUsuario(payload: { nombre: string; email: string; rol: string }) {
  const { data } = await api.post('/usuarios', payload);
  return data.data as Usuario;
}

export async function actualizarUsuario(
  id: number,
  payload: { nombre?: string; rol?: string; estado?: boolean }
) {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data.data as Usuario;
}

export async function eliminarUsuario(id: number) {
  await api.delete(`/usuarios/${id}`);
}
