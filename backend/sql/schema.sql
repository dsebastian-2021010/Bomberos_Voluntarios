-- Esquema de base de datos - Sistema de Gestión de Contactos - Bomberos Voluntarios

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario',
  estado BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_login TIMESTAMP,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta TIMESTAMP NULL,
  CONSTRAINT email_valid CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT rol_valido CHECK (rol IN ('superadmin', 'admin', 'usuario'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

CREATE TABLE IF NOT EXISTS numeros_celular (
  id SERIAL PRIMARY KEY,
  numero_telefono VARCHAR(20) NOT NULL UNIQUE,
  nombre_propietario VARCHAR(100),
  descripcion TEXT,
  usuario_id INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT true,
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT telefono_valido CHECK (numero_telefono ~ '^[0-9]{8,15}$')
);

CREATE INDEX IF NOT EXISTS idx_numeros_usuario ON numeros_celular(usuario_id);
CREATE INDEX IF NOT EXISTS idx_numeros_telefono ON numeros_celular(numero_telefono);

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
