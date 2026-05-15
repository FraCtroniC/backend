# Setup

## Requisitos

- Node.js 18 o superior.
- PostgreSQL disponible localmente o por URI remota.
- Variables de entorno definidas en `.env`.

## Variables de entorno

| Variable | Requerida | Descripcion |
|---|---:|---|
| `NODE_ENV` | No | Entorno de ejecucion: `development`, `production` o `test`. |
| `PORT` | No | Puerto del servidor. |
| `DB_ENV` | No | `local` o `remote`. Determina como se conecta Sequelize. |
| `DB_HOST_LOCAL` | Si `DB_ENV=local` | Host de la base local. |
| `DB_PORT_LOCAL` | Si `DB_ENV=local` | Puerto de la base local. |
| `DB_NAME_LOCAL` | Si `DB_ENV=local` | Nombre de la base local. |
| `DB_USER_LOCAL` | Si `DB_ENV=local` | Usuario de la base local. |
| `DB_PASS_LOCAL` | Si `DB_ENV=local` | Clave de la base local. |
| `DB_URI_REMOTE` | Si `DB_ENV=remote` | URI unica de conexion remota. |
| `JWT_SECRET` | No | Secreto de firma para tokens. |
| `JWT_EXPIRES_IN` | No | Vigencia del token, por ejemplo `1h`. |

## Configuracion local

1. Crear `.env`.
2. Definir `DB_ENV=local`.
3. Completar credenciales de PostgreSQL.
4. Ejecutar `npm install`.
5. Levantar el servicio con `npm run dev`.

## Configuracion remota

1. Crear `.env`.
2. Definir `DB_ENV=remote`.
3. Colocar `DB_URI_REMOTE` con la URI completa.
4. Ejecutar `npm start` o `npm run dev`.

## Comandos

```bash
npm install
npm run dev
npm start
```

## Verificacion rapida

- Revisar la consola para confirmar `Database connection has been established successfully`.
- Consultar `GET /api` y confirmar una respuesta con `status: ok`.
- Probar `POST /api/auth/login` o `POST /api/auth/register` para verificar validacion con `zod`, hashing y JWT.

## Problemas comunes

- Error de conexion: verificar host, puerto, base y credenciales.
- Error de validacion: revisar que `.env` cumpla el esquema de `src/config/env.js`.
- Puerto ocupado: cambiar `PORT` en `.env`.