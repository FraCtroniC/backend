# Autenticacion y seguridad

## Resumen

El proyecto incorpora un flujo de autenticacion completo basado en `zod`, `crypto` y `jsonwebtoken`.

## Componentes nuevos

- `src/validators/commonSchemas.js`: esquemas reutilizables para UUID, IDs numericos y fechas.
- `src/validators/domainSchemas.js`: schemas de negocio para registro, login, token y cambio de contrasena.
- `src/middlewares/validateZod.js`: middleware central para validar `params`, `query` y `body`.
- `src/services/passwordService.js`: hash y verificacion de contrasenas con PBKDF2.
- `src/services/jwtService.js`: firma y verificacion de tokens JWT.
- `src/middlewares/authMiddleware.js`: proteccion de rutas con Bearer token.
- `src/controllers/authController.js`: registro, login, emision manual de token, perfil y cambio de contrasena.

## Hashing de contrasenas

La clave no se guarda en texto plano.

Formato almacenado:

`pbkdf2$ITERACIONES$SALT$HASH`

Parametros observados:

- Iteraciones: `120000`
- Longitud derivada: `64`
- Digest: `sha512`

## Flujo de registro

1. `POST /api/auth/register` recibe `password`.
2. `zod` valida el payload.
3. Se verifica que `username` y `email` no esten repetidos.
4. Se busca el rol, si fue enviado.
5. La clave se hashea con `crypto.pbkdf2Sync`.
6. Se crea el usuario.
7. Se firma un JWT y se devuelve junto con el usuario sin `password_hash`.

## Flujo de login

1. `POST /api/auth/login` recibe `username` y `password`.
2. `zod` valida el payload.
3. Se busca el usuario.
4. Se verifica el estado `Activo`.
5. Se compara la clave con el hash almacenado.
6. Se firma un JWT y se responde con el token y el usuario.

## Cambio de contrasena

1. `POST /api/auth/change-password` requiere `Authorization: Bearer <token>`.
2. `requireAuth` valida el JWT y deja el payload en `req.auth`.
3. Se verifica la contrasena actual.
4. Se hashea la nueva contrasena.
5. Se valida que `confirmPassword` coincida con `newPassword`.
6. Se actualiza `password_hash`.

## JWT

- La firma usa `JWT_SECRET`.
- La expiracion usa `JWT_EXPIRES_IN`.
- El payload generado incluye `sub`, `username` y `role` en el login/registro.
- El endpoint `/api/auth/token` permite emitir un token manual a partir de un `sub`.

## Validacion con zod

Los schemas nuevos son estrictos y rechazan campos extra.

Puntos relevantes:

- `authRegisterSchema` valida registro con `password` en vez de `password_hash`.
- `authLoginSchema` valida credenciales de acceso.
- `changePasswordSchema` valida la contrasena actual, la nueva y su confirmacion.
- `userCreateSchema` y `userUpdateSchema` validan el CRUD administrativo de usuarios.

## Rutas protegidas

- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/audit-logs/:id`
- `POST /api/audit-logs`

## Recomendacion de uso

Para usuarios finales, usar siempre:

1. `POST /api/auth/register` para crear cuenta.
2. `POST /api/auth/login` para obtener token.
3. `POST /api/auth/change-password` para actualizar la clave.

El CRUD de `users` queda como capa administrativa.