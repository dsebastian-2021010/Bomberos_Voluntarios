import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bomberos_db',
  },

  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Bomberos Voluntarios',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@bomberos.local',
    adminEmails: (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean),
  },

  // Integración con la central de llamadas (sistema externo, aún por conectar).
  // Mientras estas variables no estén todas definidas, el servicio queda
  // deshabilitado y solo registra en el log lo que habría enviado.
  // Ver backend/src/services/externalBlocklistService.ts
  externalBlocklist: {
    enabled: process.env.EXTERNAL_BLOCKLIST_ENABLED === 'true',
    dbHost: process.env.EXTERNAL_DB_HOST || '',
    dbPort: parseInt(process.env.EXTERNAL_DB_PORT || '0', 10),
    dbUser: process.env.EXTERNAL_DB_USER || '',
    dbPassword: process.env.EXTERNAL_DB_PASSWORD || '',
    dbName: process.env.EXTERNAL_DB_NAME || '',
    tabla: process.env.EXTERNAL_DB_TABLA || '',
    columnaTelefono: process.env.EXTERNAL_DB_COLUMNA_TELEFONO || '',
    columnaBloqueadoHasta: process.env.EXTERNAL_DB_COLUMNA_BLOQUEADO_HASTA || '',
  },

  superadmin: {
    nombre: process.env.SUPERADMIN_NOMBRE || 'Administrador General',
    email: process.env.SUPERADMIN_EMAIL || 'superadmin@bomberos.local',
    password: process.env.SUPERADMIN_PASSWORD || '',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
