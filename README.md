# Bomberos Voluntarios — Bloqueo de Números por Llamadas de Broma

Flujo: en otro sistema, el personal de Bomberos ya identifica qué número hizo una llamada de broma o falsa. Cuando eso pasa, un bombero entra aquí, registra ese número con una razón, y el sistema lo deja bloqueado por **48 horas** (bloqueo con vencimiento automático) — sincronizándolo con la central de llamadas externa — y avisa al SuperAdmin por correo con el número y la razón. Incluye autenticación JWT y roles administrativos. La interfaz usa la paleta de colores institucional (rojo, negro y dorado) de la página oficial de Bomberos Voluntarios Guatemala.

La aplicación es deliberadamente mínima: login, el formulario para bloquear un número, la lista de bloqueos activos, y la gestión de usuarios (solo SuperAdmin). Nada más.

## Estructura del proyecto

```
Bomberos_Voluntarios/
├── backend/     # API REST — Node.js + Express + TypeScript + PostgreSQL
├── frontend/    # SPA — React + TypeScript + Vite + Tailwind CSS
└── docker-compose.yml
```

## Roles del sistema

Solo ingresan SuperAdmin y bomberos — no hay registro público.

| Rol | Permisos |
|---|---|
| **SuperAdmin** | Todo lo de "bombero", más: crea/edita/elimina usuarios y cambia roles |
| **Bombero** | Registra un número con su razón para bloquearlo por 48h, ve la lista de bloqueos |

## Modelo de datos

- **`numeros_bloqueados`**: un registro por cada vez que un bombero reporta un número. Guarda la razón, quién lo reportó, `fecha_bloqueo`, `fecha_expiracion` (siempre `fecha_bloqueo + 48 horas`) y el estado de sincronización con la central de llamadas externa.
- El vencimiento a las 48h es automático: no hay que desbloquear nada a mano, el frontend calcula si sigue vigente comparando `fecha_expiracion` contra la hora actual.

## ⚠️ Integración pendiente: central de llamadas externa

El bloqueo real de la llamada ocurre en **otra base de datos que ya existe** (la central de llamadas de Bomberos), a la que este sistema todavía no está conectado porque no se tienen los datos de acceso. Todo el código está preparado para que conectarla sea cuestión de llenar variables de entorno:

1. El único archivo que hay que tocar es **`backend/src/services/externalBlocklistService.ts`** — tiene comentado exactamente qué debe hacer.
2. Las variables a llenar en `backend/.env` son las que empiezan con `EXTERNAL_` (ver `.env.example`): motor/host/credenciales de esa base de datos y los nombres de su tabla y columnas de teléfono/bloqueo.
3. Mientras `EXTERNAL_BLOCKLIST_ENABLED` no sea `true`, el sistema sigue funcionando normalmente (guarda el bloqueo, envía el correo), pero dejará la columna `sincronizado_externo` en `false` y se verá "Pendiente" en la interfaz — es el comportamiento esperado hasta que se conecte.

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
