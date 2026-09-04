import { api } from './api';

export interface Numero {
  id: number;
  numero_telefono: string;
  nombre_propietario: string | null;
  descripcion: string | null;
  usuario_id: number;
  fecha_creacion: string;
  fecha_modificacion: string;
  activo: boolean;
  creado_por?: string;
  creado_por_email?: string;
}

export async function listarNumeros() {
  const { data } = await api.get('/numeros');
  return data.data as Numero[];
}

export async function crearNumero(payload: {
  numeroTelefono: string;
  nombrePropietario?: string;
  descripcion?: string;
}) {
  const { data } = await api.post('/numeros', payload);
  return data.data as Numero;
}

export async function actualizarNumero(
  id: number,
  payload: { nombrePropietario?: string; descripcion?: string }
) {
  const { data } = await api.put(`/numeros/${id}`, payload);
  return data.data as Numero;
}

export async function eliminarNumero(id: number) {
  await api.delete(`/numeros/${id}`);
}
