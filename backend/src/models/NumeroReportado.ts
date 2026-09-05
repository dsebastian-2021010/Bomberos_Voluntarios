import pool from '../config/database';

export interface NumeroReportado {
  id: number;
  numero_telefono: string;
  bloqueado: boolean;
  total_reportes: number;
  fecha_primer_reporte: Date;
  fecha_ultimo_reporte: Date;
  bloqueado_por: number | null;
  fecha_bloqueo: Date | null;
  notas: string | null;
}

export interface NumeroReportadoConDetalle extends NumeroReportado {
  bloqueado_por_nombre: string | null;
}

export async function buscarPorTelefono(numeroTelefono: string): Promise<NumeroReportado | null> {
  const result = await pool.query('SELECT * FROM numeros_reportados WHERE numero_telefono = $1', [
    numeroTelefono,
  ]);
  return result.rows[0] || null;
}

export async function buscarPorId(id: number): Promise<NumeroReportado | null> {
  const result = await pool.query('SELECT * FROM numeros_reportados WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function listarTodos(): Promise<NumeroReportadoConDetalle[]> {
  const result = await pool.query(
    `SELECT n.*, u.nombre AS bloqueado_por_nombre
     FROM numeros_reportados n
     LEFT JOIN usuarios u ON u.id = n.bloqueado_por
     ORDER BY n.fecha_ultimo_reporte DESC`
  );
  return result.rows;
}

export async function crearNumeroReportado(numeroTelefono: string): Promise<NumeroReportado> {
  const result = await pool.query(
    `INSERT INTO numeros_reportados (numero_telefono, total_reportes)
     VALUES ($1, 0)
     RETURNING *`,
    [numeroTelefono]
  );
  return result.rows[0];
}

export async function registrarNuevoReporte(id: number): Promise<NumeroReportado> {
  const result = await pool.query(
    `UPDATE numeros_reportados
     SET total_reportes = total_reportes + 1, fecha_ultimo_reporte = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
}

export async function bloquearNumero(id: number, usuarioId: number): Promise<NumeroReportado | null> {
  const result = await pool.query(
    `UPDATE numeros_reportados
     SET bloqueado = true, bloqueado_por = $2, fecha_bloqueo = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, usuarioId]
  );
  return result.rows[0] || null;
}

export async function desbloquearNumero(id: number): Promise<NumeroReportado | null> {
  const result = await pool.query(
    `UPDATE numeros_reportados
     SET bloqueado = false, bloqueado_por = NULL, fecha_bloqueo = NULL
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

export async function eliminarNumeroReportado(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM numeros_reportados WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
