import pool from '../config/database';

export interface Numero {
  id: number;
  numero_telefono: string;
  nombre_propietario: string | null;
  descripcion: string | null;
  usuario_id: number;
  fecha_creacion: Date;
  fecha_modificacion: Date;
  activo: boolean;
}

export interface NumeroConPropietario extends Numero {
  creado_por: string;
  creado_por_email: string;
}

export async function crearNumero(data: {
  numeroTelefono: string;
  nombrePropietario?: string;
  descripcion?: string;
  usuarioId: number;
}): Promise<Numero> {
  const result = await pool.query(
    `INSERT INTO numeros_celular (numero_telefono, nombre_propietario, descripcion, usuario_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.numeroTelefono, data.nombrePropietario || null, data.descripcion || null, data.usuarioId]
  );
  return result.rows[0];
}

export async function listarTodos(): Promise<NumeroConPropietario[]> {
  const result = await pool.query(
    `SELECT n.*, u.nombre AS creado_por, u.email AS creado_por_email
     FROM numeros_celular n
     JOIN usuarios u ON u.id = n.usuario_id
     WHERE n.activo = true
     ORDER BY n.fecha_creacion DESC`
  );
  return result.rows;
}

export async function listarPorUsuario(usuarioId: number): Promise<Numero[]> {
  const result = await pool.query(
    `SELECT * FROM numeros_celular WHERE usuario_id = $1 AND activo = true ORDER BY fecha_creacion DESC`,
    [usuarioId]
  );
  return result.rows;
}

export async function buscarPorId(id: number): Promise<Numero | null> {
  const result = await pool.query('SELECT * FROM numeros_celular WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function actualizarNumero(
  id: number,
  data: { nombrePropietario?: string; descripcion?: string }
): Promise<Numero | null> {
  const campos: string[] = [];
  const valores: unknown[] = [];
  let idx = 1;

  if (data.nombrePropietario !== undefined) {
    campos.push(`nombre_propietario = $${idx++}`);
    valores.push(data.nombrePropietario);
  }
  if (data.descripcion !== undefined) {
    campos.push(`descripcion = $${idx++}`);
    valores.push(data.descripcion);
  }
  campos.push(`fecha_modificacion = CURRENT_TIMESTAMP`);

  valores.push(id);
  const result = await pool.query(
    `UPDATE numeros_celular SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
    valores
  );
  return result.rows[0] || null;
}

export async function eliminarNumero(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM numeros_celular WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
