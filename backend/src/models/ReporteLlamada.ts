import pool from '../config/database';

export type Motivo = 'broma' | 'falsa_alarma' | 'dato_erroneo' | 'otro';

export interface ReporteLlamada {
  id: number;
  numero_reportado_id: number;
  motivo: Motivo;
  descripcion: string | null;
  usuario_id: number;
  fecha_hora: Date;
}

export interface ReporteLlamadaConUsuario extends ReporteLlamada {
  usuario_nombre: string;
}

export async function crearReporte(data: {
  numeroReportadoId: number;
  motivo: Motivo;
  descripcion?: string;
  usuarioId: number;
}): Promise<ReporteLlamada> {
  const result = await pool.query(
    `INSERT INTO reportes_llamada (numero_reportado_id, motivo, descripcion, usuario_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.numeroReportadoId, data.motivo, data.descripcion || null, data.usuarioId]
  );
  return result.rows[0];
}

export async function listarPorNumero(numeroReportadoId: number): Promise<ReporteLlamadaConUsuario[]> {
  const result = await pool.query(
    `SELECT r.*, u.nombre AS usuario_nombre
     FROM reportes_llamada r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.numero_reportado_id = $1
     ORDER BY r.fecha_hora DESC`,
    [numeroReportadoId]
  );
  return result.rows;
}
