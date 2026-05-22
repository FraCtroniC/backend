# Backend API Académica

API REST construida con Node.js, Express y Sequelize para gestionar usuarios, carreras, materias, pensum, secciones, estudiantes, docentes, inscripciones y solicitudes de documentos.

## Tecnologias

- Node.js
- Express 5
- Sequelize
- PostgreSQL
- Joi
- express-validator
- Helmet, CORS y Morgan

## Requisitos

- Node.js 18 o superior
- PostgreSQL 13 o superior
- Archivo `.env` configurado

## Instalacion

```bash
npm install
```

Nota: este proyecto usa `patch-package` para mantener un fix permanente a la advertencia `DEP0169` de `url.parse()` en una dependencia transitive. El parche se aplica automaticamente en `postinstall`.

Crear el archivo `.env` en la raiz del proyecto con variables como:

```env
NODE_ENV=development
PORT=3000
DB_ENV=local
DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=5432
DB_NAME_LOCAL=backend_db
DB_USER_LOCAL=postgres
DB_PASS_LOCAL=secret
JWT_SECRET=change_me
EMAIL_TRANSPORT=log
EMAIL_FROM=no-reply@example.com
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

Para envio real de correos, configura `EMAIL_TRANSPORT=smtp` y completa las variables SMTP.

## Ejecucion

```bash
npm run dev
```

```bash
npm start
```

## Estructura

- `src/server.js`: arranque de la aplicacion y verificacion de la conexion a BD.
- `src/app.js`: configuracion de Express y middlewares.
- `src/routes/`: definicion de rutas por recurso.
- `src/controllers/`: logica de negocio y acceso a modelos.
- `src/models/`: modelos Sequelize y asociaciones.
- `src/config/`: variables de entorno y conexion a la base de datos.
- `src/middlewares/`: manejo de errores y validaciones.
- `Docs/`: documentacion tecnica y funcional.
- `postman/`: coleccion de Postman y recursos compartidos.

## Endpoints base

La API se expone bajo `/api`.

- `GET /api`: health check.
- `POST /api/auth/forgot-password`
- `GET /api/users`
- `GET /api/careers`
- `GET /api/subjects`
- `GET /api/sections`
- `GET /api/students`
- `GET /api/teachers`
- `GET /api/registrations`
- `GET /api/registration-details`
- `GET /api/pensums`
- `GET /api/pensum-subjects`
- `GET /api/prerequisites`
- `GET /api/roles`
- `GET /api/periods`
- `GET /api/audit-logs`
- `GET /api/document-requests`

## Documentacion

- [Autenticacion y seguridad](Docs/Auth.md)
- [Arquitectura](Docs/Architecture.md)
- [Setup](Docs/Setup.md)
- [API](Docs/API.md)
- [Modelos](Docs/Models.md)

## Postman

La coleccion base se encuentra en `postman/backend-api.postman_collection.json`.

## Contribucion

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Cambios

Ver [CHANGELOG.md](CHANGELOG.md).