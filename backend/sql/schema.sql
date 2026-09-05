-- Esquema de base de datos - Bloqueo de Números por Llamadas de Broma - Bomberos Voluntarios

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'bombero',
  estado BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_login TIMESTAMP,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta TIMESTAMP NULL,
  CONSTRAINT email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT rol_valido CHECK (rol IN ('superadmin', 'bombero'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Cada vez que un bombero reporta un número, se crea un registro de bloqueo de 48 horas.
-- El bloqueo real ocurre en el sistema externo de la central de llamadas (ver
-- backend/src/services/externalBlocklistService.ts); esta tabla es el registro
-- interno de auditoría y lo que alimenta la sincronización hacia ese sistema.
CREATE TABLE IF NOT EXISTS numeros_bloqueados (
  id SERIAL PRIMARY KEY,
  numero_telefono VARCHAR(20) NOT NULL,
  razon TEXT NOT NULL,
  usuario_id INT NOT NULL,
  fecha_bloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP NOT NULL,
  sincronizado_externo BOOLEAN NOT NULL DEFAULT false,
  fecha_sincronizado TIMESTAMP NULL,
  error_sincronizacion TEXT NULL,
  CONSTRAINT fk_usuario_bloqueo FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT telefono_valido CHECK (numero_telefono ~ '^[0-9]{8,15}$')
);

CREATE INDEX IF NOT EXISTS idx_bloqueos_telefono ON numeros_bloqueados(numero_telefono);
CREATE INDEX IF NOT EXISTS idx_bloqueos_expiracion ON numeros_bloqueados(fecha_expiracion);
CREATE INDEX IF NOT EXISTS idx_bloqueos_usuario ON numeros_bloqueados(usuario_id);

CREATE TABLE IF NOT EXISTS log_auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(50) NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id INT,
  datos_anterior JSONB,
  datos_nuevo JSONB,
  ip_origen VARCHAR(45),
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_log FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON log_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON log_auditoria(fecha_hora);
