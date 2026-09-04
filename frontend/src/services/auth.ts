import { api } from './api';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'superadmin' | 'admin' | 'usuario';
  estado?: boolean;
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data as { accessToken: string; refreshToken: string; usuario: Usuario };
}

export async function obtenerPerfil() {
  const { data } = await api.get('/auth/me');
  return data.data as Usuario;
}

export async function cambiarPassword(passwordActual: string, passwordNueva: string) {
  const { data } = await api.put('/auth/cambiar-password', { passwordActual, passwordNueva });
  return data.data as { message: string };
}

export async function logout() {
  await api.post('/auth/logout').catch(() => undefined);
}
