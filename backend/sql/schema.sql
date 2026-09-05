-- Esquema de base de datos - Registro y Bloqueo de Llamadas Falsas/Broma - Bomberos Voluntarios

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

-- Un registro por cada número de teléfono que ha reportado una llamada falsa/broma
CREATE TABLE IF NOT EXISTS numeros_reportados (
  id SERIAL PRIMARY KEY,
  numero_telefono VARCHAR(20) NOT NULL UNIQUE,
  bloqueado BOOLEAN DEFAULT false,
  total_reportes INT NOT NULL DEFAULT 0,
  fecha_primer_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultimo_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bloqueado_por INT NULL,
  fecha_bloqueo TIMESTAMP NULL,
  notas TEXT,
  CONSTRAINT fk_bloqueado_por FOREIGN KEY (bloqueado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  CONSTRAINT telefono_valido CHECK (numero_telefono ~ '^[0-9]{8,15}$')
);

CREATE INDEX IF NOT EXISTS idx_numeros_reportados_telefono ON numeros_reportados(numero_telefono);
CREATE INDEX IF NOT EXISTS idx_numeros_reportados_bloqueado ON numeros_reportados(bloqueado);

-- Cada llamada individual reportada como broma/falsa para un número
CREATE TABLE IF NOT EXISTS reportes_llamada (
  id SERIAL PRIMARY KEY,
  numero_reportado_id INT NOT NULL,
  motivo VARCHAR(20) NOT NULL,
  descripcion TEXT,
  usuario_id INT NOT NULL,
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_numero_reportado FOREIGN KEY (numero_reportado_id) REFERENCES numeros_reportados(id) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_reporte FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT motivo_valido CHECK (motivo IN ('broma', 'falsa_alarma', 'dato_erroneo', 'otro'))
);

CREATE INDEX IF NOT EXISTS idx_reportes_numero ON reportes_llamada(numero_reportado_id);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes_llamada(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes_llamada(fecha_hora);

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
