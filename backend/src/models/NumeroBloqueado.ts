import pool from '../config/database';

export interface NumeroBloqueado {
  id: number;
  numero_telefono: string;
  razon: string;
  usuario_id: number;
  fecha_bloqueo: Date;
  fecha_expiracion: Date;
  sincronizado_externo: boolean;
  fecha_sincronizado: Date | null;
  error_sincronizacion: string | null;
}

export interface NumeroBloqueadoConDetalle extends NumeroBloqueado {
  reportado_por: string;
  vigente: boolean;
}

const HORAS_BLOQUEO = 48;

export async function crearBloqueo(data: {
  numeroTelefono: string;
  razon: string;
  usuarioId: number;
}): Promise<NumeroBloqueado> {
  const result = await pool.query(
    `INSERT INTO numeros_bloqueados (numero_telefono, razon, usuario_id, fecha_expiracion)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '${HORAS_BLOQUEO} hours')
     RETURNING *`,
    [data.numeroTelefono, data.razon, data.usuarioId]
  );
  return result.rows[0];
}

export async function listarTodos(): Promise<NumeroBloqueadoConDetalle[]> {
  const result = await pool.query(
    `SELECT b.*, u.nombre AS reportado_por, (b.fecha_expiracion > CURRENT_TIMESTAMP) AS vigente
     FROM numeros_bloqueados b
     JOIN usuarios u ON u.id = b.usuario_id
     ORDER BY b.fecha_bloqueo DESC`
  );
  return result.rows;
}

export async function buscarPorId(id: number): Promise<NumeroBloqueado | null> {
  const result = await pool.query('SELECT * FROM numeros_bloqueados WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function marcarSincronizado(
  id: number,
  data: { exito: boolean; error?: string }
): Promise<void> {
  await pool.query(
    `UPDATE numeros_bloqueados
     SET sincronizado_externo = $2, fecha_sincronizado = CURRENT_TIMESTAMP, error_sincronizacion = $3
     WHERE id = $1`,
    [id, data.exito, data.error || null]
  );
}
