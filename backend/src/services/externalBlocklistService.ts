import { config } from '../config/environment';

/**
 * Integración con la central de llamadas de Bomberos (sistema externo).
 *
 * TODAVÍA NO ESTÁ CONECTADA porque no tenemos los datos de esa base de datos
 * (motor, host, credenciales, ni la estructura de su tabla de llamadas).
 * Este archivo es el ÚNICO lugar que hay que tocar cuando se tengan esos datos:
 * el resto del sistema (controller, modelo, frontend) ya llama a
 * `sincronizarBloqueoExterno` y no necesita cambiar.
 *
 * Qué debe hacer esta función cuando se conecte de verdad:
 *   1. Conectarse a la base de datos externa (o llamar a su API, según cómo
 *      esté expuesta) usando `config.externalBlocklist`.
 *   2. Buscar el número de teléfono en su tabla de llamadas/bloqueos.
 *   3. Marcarlo como bloqueado hasta `fechaExpiracion` (el campo que exponga
 *      esa tabla — quizás un timestamp "bloqueado_hasta" o similar).
 *   4. Devolver { exito: true } si se pudo, o { exito: false, error } si no.
 *
 * Mientras `EXTERNAL_BLOCKLIST_ENABLED` no sea "true" en el .env, esta función
 * no intenta conectarse a nada: solo deja constancia en el log y en la tabla
 * `numeros_bloqueados` (columna `sincronizado_externo`) de que quedó pendiente.
 */

export interface ResultadoSincronizacion {
  exito: boolean;
  error?: string;
}

export async function sincronizarBloqueoExterno(
  numeroTelefono: string,
  fechaExpiracion: Date
): Promise<ResultadoSincronizacion> {
  if (!config.externalBlocklist.enabled) {
    console.warn(
      `[ExternalBlocklist] Integración no configurada. Pendiente bloquear ${numeroTelefono} hasta ${fechaExpiracion.toISOString()} en la central de llamadas.`
    );
    return { exito: false, error: 'Integración externa no configurada todavía' };
  }

  // --------------------------------------------------------------------
  // TODO: implementar la conexión real aquí una vez se tengan los datos
  // de la base de datos/API de la central de llamadas. Ejemplo orientativo
  // si resulta ser una base de datos relacional accesible por red:
  //
  //   const externalPool = new Pool({
  //     host: config.externalBlocklist.dbHost,
  //     port: config.externalBlocklist.dbPort,
  //     user: config.externalBlocklist.dbUser,
  //     password: config.externalBlocklist.dbPassword,
  //     database: config.externalBlocklist.dbName,
  //   });
  //   await externalPool.query(
  //     `UPDATE ${config.externalBlocklist.tabla}
  //      SET ${config.externalBlocklist.columnaBloqueadoHasta} = $2
  //      WHERE ${config.externalBlocklist.columnaTelefono} = $1`,
  //     [numeroTelefono, fechaExpiracion]
  //   );
  // --------------------------------------------------------------------

  console.error('[ExternalBlocklist] EXTERNAL_BLOCKLIST_ENABLED=true pero falta implementar la conexión real.');
  return { exito: false, error: 'Integración marcada como habilitada pero sin implementar' };
}
