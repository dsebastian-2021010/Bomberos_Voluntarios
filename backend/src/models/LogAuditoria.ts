import pool from '../config/database';

export type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FALLIDO';

export async function registrarAuditoria(data: {
  usuarioId: number | null;
  accion: AccionAuditoria;
  tablaAfectada?: string;
  registroId?: number;
  datosAnterior?: unknown;
  datosNuevo?: unknown;
  ipOrigen?: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO log_auditoria
       (usuario_id, accion, tabla_afectada, registro_id, datos_anterior, datos_nuevo, ip_origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      data.usuarioId,
      data.accion,
      data.tablaAfectada || null,
      data.registroId || null,
      data.datosAnterior ? JSON.stringify(data.datosAnterior) : null,
      data.datosNuevo ? JSON.stringify(data.datosNuevo) : null,
      data.ipOrigen || null,
    ]
  );
}

export async function listarAuditoria(limite = 100) {
  const result = await pool.query(
    `SELECT l.*, u.nombre AS usuario_nombre, u.email AS usuario_email
     FROM log_auditoria l
     LEFT JOIN usuarios u ON u.id = l.usuario_id
     ORDER BY l.fecha_hora DESC
     LIMIT $1`,
    [limite]
  );
  return result.rows;
}
