# Arquitectura

Este proyecto sigue una arquitectura por capas:

1. `src/server.js` inicia la aplicacion y valida la conexion a la base de datos.
2. `src/app.js` configura Express, seguridad, logs y parsing de peticiones.
3. `src/routes/` agrupa los recursos REST y conecta cada ruta con su controlador.
4. `src/controllers/` contiene la logica de cada entidad.
5. `src/models/` define los modelos Sequelize y sus asociaciones.
6. `src/config/` resuelve variables de entorno y conexion a PostgreSQL.
7. `src/middlewares/` centraliza errores y respuestas 404.

## Flujo de una peticion

Cliente -> Ruta -> Controlador -> Modelo -> Base de datos -> Respuesta

## Capas principales

### Entrada de aplicacion

- `src/server.js` ejecuta `testConnection()` antes de levantar el servidor.
- Si la base de datos no responde, el proceso finaliza con codigo de error.

### Aplicacion Express

- `src/app.js` aplica `helmet`, `cors`, `morgan`, `json` y `urlencoded`.
- Todas las rutas quedan agrupadas bajo `/api`.

### Datos

- `src/config/database.js` crea la instancia Sequelize.
- Soporta dos modos: local y remoto.
- El modo local construye la URI desde credenciales individuales.

### Dominio

- Los controladores trabajan directamente con los modelos Sequelize.
- Las validaciones de entrada se hacen en las rutas con `express-validator`.

## Modulos funcionales

- Usuarios y roles
- Carreras y pensums
- Materias y prerrequisitos
- Secciones y docentes
- Estudiantes e inscripciones
- Periodos academicos
- Solicitudes de documentos
- Registro de auditoria

## Manejo de errores

- `404` cuando no existe una ruta o un registro.
- `400` para errores de validacion.
- `500` para errores no controlados.

## Dependencias clave

- `express`: servidor HTTP.
- `sequelize`: ORM.
- `pg`: driver PostgreSQL.
- `joi`: validacion de entorno.
- `express-validator`: validacion de payloads.