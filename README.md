# Bomberos Voluntarios — Sistema de Gestión de Contactos

Sistema seguro para la gestión centralizada de números telefónicos de contacto de los Bomberos Voluntarios, con autenticación JWT, roles administrativos y notificaciones por correo. La interfaz usa la paleta de colores institucional (rojo, negro y dorado) de la página oficial de Bomberos Voluntarios Guatemala.

## Estructura del proyecto

```
Bomberos_Voluntarios/
├── backend/     # API REST — Node.js + Express + TypeScript + PostgreSQL
├── frontend/    # SPA — React + TypeScript + Vite + Tailwind CSS
└── docker-compose.yml
```

## Roles del sistema

| Rol | Permisos |
|---|---|
| **SuperAdmin** | Crea/edita/elimina usuarios, cambia roles, ve todos los números |
| **Admin** | Ve y gestiona todos los números telefónicos |
| **Usuario** | Ve y gestiona únicamente sus propios números |

## Requisitos previos

- Node.js 18+
- [pnpm](https://pnpm.io/installation) 9+ (gestor de paquetes del proyecto; instálalo con `corepack enable && corepack prepare pnpm@10.33.0 --activate` — corepack viene incluido con Node.js 18+)
- PostgreSQL 13+
- Cuenta SMTP (Gmail App Password, SendGrid, Mailtrap, etc.)

## 1. Base de datos

```bash
psql -U postgres -c "CREATE DATABASE bomberos_db;"
psql -U postgres -d bomberos_db -f backend/sql/schema.sql
```

## 2. Backend

```bash
cd backend
cp .env.example .env   # completa tus credenciales de DB, JWT y SMTP
pnpm install
pnpm run build
pnpm run seed            # crea el SuperAdmin inicial (revisa la consola para la contraseña)
pnpm run dev              # http://localhost:3000
```

## 3. Frontend

```bash
cd frontend
cp .env.example .env    # define VITE_API_URL si es distinto de http://localhost:3000/api
pnpm install
pnpm run dev               # http://localhost:5173
```

## Con Docker Compose

```bash
cp backend/.env.example .env   # y completa las variables requeridas
docker compose --env-file .env up --build
```

## Notas de seguridad

- Contraseñas hasheadas con bcrypt (salt rounds 12).
- Autenticación con JWT (access token 15 min, refresh token 7 días).
- Rate limiting en login (5 intentos/15 min) y creación de usuarios.
- Headers de seguridad con Helmet, CORS restringido al `FRONTEND_URL`.
- Log de auditoría de todas las operaciones CREATE/UPDATE/DELETE.
- Nunca subas el archivo `.env` al repositorio (ya está en `.gitignore`).
