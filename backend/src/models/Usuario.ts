import pool from '../config/database';

export type Rol = 'superadmin' | 'admin' | 'usuario';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
  estado: boolean;
  fecha_creacion: Date;
  fecha_ultima_login: Date | null;
  intentos_fallidos: number;
  bloqueado_hasta: Date | null;
}

export type UsuarioPublico = Omit<Usuario, 'password_hash'>;

const COLUMNAS_PUBLICAS = `id, nombre, email, rol, estado, fecha_creacion, fecha_ultima_login`;

export async function crearUsuario(data: {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
}): Promise<UsuarioPublico> {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [data.nombre, data.email, data.passwordHash, data.rol]
  );
  return result.rows[0];
}

export async function buscarPorEmail(email: string): Promise<Usuario | null> {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function buscarPorId(id: number): Promise<Usuario | null> {
  const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function listarUsuarios(): Promise<UsuarioPublico[]> {
  const result = await pool.query(
    `SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY fecha_creacion DESC`
  );
  return result.rows;
}

export async function actualizarUsuario(
  id: number,
  data: { nombre?: string; rol?: Rol; estado?: boolean }
): Promise<UsuarioPublico | null> {
  const campos: string[] = [];
  const valores: unknown[] = [];
  let idx = 1;

  if (data.nombre !== undefined) {
    campos.push(`nombre = $${idx++}`);
    valores.push(data.nombre);
  }
  if (data.rol !== undefined) {
    campos.push(`rol = $${idx++}`);
    valores.push(data.rol);
  }
  if (data.estado !== undefined) {
    campos.push(`estado = $${idx++}`);
    valores.push(data.estado);
  }

  if (campos.length === 0) {
    return buscarPorId(id) as unknown as Promise<UsuarioPublico | null>;
  }

  valores.push(id);
  const result = await pool.query(
    `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNAS_PUBLICAS}`,
    valores
  );
  return result.rows[0] || null;
}

export async function actualizarPassword(id: number, passwordHash: string): Promise<void> {
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}

export async function eliminarUsuario(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function registrarLogin(id: number): Promise<void> {
  await pool.query(
    'UPDATE usuarios SET fecha_ultima_login = CURRENT_TIMESTAMP, intentos_fallidos = 0 WHERE id = $1',
    [id]
  );
}

export async function registrarIntentoFallido(id: number): Promise<void> {
  await pool.query('UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1', [id]);
}

export async function contarSuperadmins(): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*)::int AS total FROM usuarios WHERE rol = 'superadmin'`);
  return result.rows[0].total;
}
