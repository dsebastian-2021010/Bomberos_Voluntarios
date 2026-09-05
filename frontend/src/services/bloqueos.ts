import { api } from './api';

export interface NumeroBloqueado {
  id: number;
  numero_telefono: string;
  razon: string;
  usuario_id: number;
  fecha_bloqueo: string;
  fecha_expiracion: string;
  sincronizado_externo: boolean;
  fecha_sincronizado: string | null;
  error_sincronizacion: string | null;
  reportado_por: string;
  vigente: boolean;
}

export async function listarBloqueos() {
  const { data } = await api.get('/bloqueos');
  return data.data as NumeroBloqueado[];
}

export async function crearBloqueo(payload: { numeroTelefono: string; razon: string }) {
  const { data } = await api.post('/bloqueos', payload);
  return data.data as NumeroBloqueado;
}
