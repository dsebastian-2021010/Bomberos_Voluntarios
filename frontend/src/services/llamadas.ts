import { api } from './api';

export type Motivo = 'broma' | 'falsa_alarma' | 'dato_erroneo' | 'otro';

export const MOTIVOS: { value: Motivo; label: string }[] = [
  { value: 'broma', label: 'Broma' },
  { value: 'falsa_alarma', label: 'Falsa alarma' },
  { value: 'dato_erroneo', label: 'Dato erróneo' },
  { value: 'otro', label: 'Otro' },
];

export interface NumeroReportado {
  id: number;
  numero_telefono: string;
  bloqueado: boolean;
  total_reportes: number;
  fecha_primer_reporte: string;
  fecha_ultimo_reporte: string;
  bloqueado_por: number | null;
  fecha_bloqueo: string | null;
  notas: string | null;
  bloqueado_por_nombre?: string | null;
}

export interface ReporteLlamada {
  id: number;
  numero_reportado_id: number;
  motivo: Motivo;
  descripcion: string | null;
  usuario_id: number;
  fecha_hora: string;
  usuario_nombre: string;
}

export async function listarNumeros() {
  const { data } = await api.get('/llamadas');
  return data.data as NumeroReportado[];
}

export async function obtenerHistorial(id: number) {
  const { data } = await api.get(`/llamadas/${id}/reportes`);
  return data.data as { numero: NumeroReportado; reportes: ReporteLlamada[] };
}

export async function reportarLlamada(payload: {
  numeroTelefono: string;
  motivo: Motivo;
  descripcion?: string;
}) {
  const { data } = await api.post('/llamadas', payload);
  return data.data as { numero: NumeroReportado; reporte: ReporteLlamada };
}

export async function bloquearNumero(id: number) {
  const { data } = await api.put(`/llamadas/${id}/bloquear`);
  return data.data as NumeroReportado;
}

export async function desbloquearNumero(id: number) {
  const { data } = await api.put(`/llamadas/${id}/desbloquear`);
  return data.data as NumeroReportado;
}

export async function eliminarNumero(id: number) {
  await api.delete(`/llamadas/${id}`);
}
