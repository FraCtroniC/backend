# API

## Base URL

`http://localhost:3000/api`

## Respuestas comunes

- `200 OK`: lectura o actualizacion exitosa.
- `201 Created`: recurso creado.
- `204 No Content`: eliminacion exitosa.
- `400 Bad Request`: errores de validacion.
- `404 Not Found`: recurso inexistente.
- `500 Internal Server Error`: error no controlado.

## Health check

- `GET /api`

Respuesta esperada:

```json
{ "status": "ok", "timestamp": "2026-05-12T00:00:00.000Z" }
```

## Autenticacion

La ruta base de autenticacion es `/api/auth`.

La documentacion Swagger esta disponible en `/api/docs`.

### Registro

- `POST /auth/register`

Comportamiento:

- Valida el payload con `zod`.
- Hashea la clave con `crypto.pbkdf2Sync`.
- Crea el usuario.
- Devuelve `token_type`, `access_token`, `expires_in` y el objeto `user` sin `password_hash`.

Campos principales: `id_role`, `document_id`, `username`, `password`, `name`, `lastname`, `email`, `status`.

### Login

- `POST /auth/login`

Comportamiento:

- Valida el payload con `zod`.
- Busca el usuario por `username`.
- Verifica la clave con `crypto.pbkdf2Sync` y `crypto.timingSafeEqual`.
- Devuelve un token Bearer y el usuario autenticado.

Campos principales: `username`, `password`.

### Emision manual de token

- `POST /auth/token`

Comportamiento:

- Permite firmar un token a partir de un `sub`, un `role` opcional y un `expiresIn` opcional.

Campos principales: `sub`, `role`, `expiresIn`.

### Perfil autenticado

- `GET /auth/me`

Comportamiento:

- Requiere un header `Authorization: Bearer <token>`.
- Devuelve el payload autenticado en `req.auth`.

### Perfil de usuario

- `GET /auth/profile`

Comportamiento:

- Requiere un header `Authorization: Bearer <token>`.
- Busca el usuario autenticado por `req.auth.sub`.
- Devuelve solo `id`, `email`, `name`, `lastname` y `role`.

Respuesta `200`:

```json
{
  "id": "8baf8f0d-3c43-4d5d-9bc8-2bdc9f7b71d1",
  "email": "usuario@correo.com",
  "name": "Juan",
  "lastname": "Perez",
  "role": "Estudiante"
}
```

### Actualizacion de perfil

- `PUT /auth/profile_update`

Comportamiento:

- Requiere autenticacion.
- Permite actualizar `email`, `name` y `lastname`.
- No permite modificar `password_hash`, `username`, `document_id` ni `status` desde este flujo.
- Valida que se envie al menos un campo.

Ejemplo de request:

```json
{
  "email": "nuevo@correo.com",
  "name": "Juan",
  "lastname": "Perez"
}
```

Respuesta `200`:

```json
{
  "id": "8baf8f0d-3c43-4d5d-9bc8-2bdc9f7b71d1",
  "email": "nuevo@correo.com",
  "name": "Juan",
  "lastname": "Perez",
  "role": "Estudiante"
}
```

### Cambio de contrasena

- `POST /auth/change-password`

Comportamiento:

- Requiere autenticacion.
- Valida `currentPassword` y `newPassword`.
- Verifica la contrasena actual y actualiza `password_hash` con un nuevo hash PBKDF2.

Campos principales: `currentPassword`, `newPassword`.

### Recuperar contrasena

- `POST /auth/forgot-password`

Comportamiento:

- Recibe un `email` en el body.
- Si el correo no existe, devuelve `404` con mensaje informativo.
- Si el correo existe, genera una contrasena temporal, actualiza `password_hash` y envia la nueva contrasena por email.
- La contrasena temporal no expira automaticamente en esta version.

Campos principales: `email`.

Ejemplo de request:

```json
{ "email": "usuario@correo.com" }
```

Respuesta `200`:

```json
{ "message": "Se envio una nueva contrasena temporal al correo indicado" }
```

Respuesta `404`:

```json
{ "message": "No existe un usuario registrado con ese correo" }
```

## Recursos

### Usuarios

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

Campos principales: `id_role`, `document_id`, `username`, `password_hash`, `name`, `lastname`, `email`, `status`.

Nota: el CRUD de `users` mantiene compatibilidad administrativa con `password_hash`, mientras que el flujo recomendado para usuarios finales es `auth/register` y `auth/change-password`.

### Carreras

- `GET /careers`
- `GET /careers/:id`
- `POST /careers`
- `PUT /careers/:id`
- `DELETE /careers/:id`

Campos principales: `code_career`, `name_career`, `total_semesters`, `is_active`.

### Materias

- `GET /subjects`
- `GET /subjects/:id`
- `POST /subjects`
- `PUT /subjects/:id`
- `DELETE /subjects/:id`

Campos principales: `code_subject`, `name_subject`, `credit_units`.

### Secciones

- `GET /sections`
- `GET /sections/:id`
- `POST /sections`
- `PUT /sections/:id`
- `DELETE /sections/:id`

Campos principales: `id_period`, `id_subject`, `id_teacher`, `section_code`, `quota_max`, `classroom`, `schedule_info`.

### Estudiantes

- `GET /students`
- `GET /students/:id`
- `POST /students`
- `PUT /students/:id`
- `DELETE /students/:id`

Campos principales: `id_user`, `id_career`, `current_semester`, `status`, `admission_date`.

### Docentes

- `GET /teachers`
- `GET /teachers/:id`
- `POST /teachers`
- `PUT /teachers/:id`
- `DELETE /teachers/:id`

Campos principales: `id_user`, `academic_grade`, `profession`.

### Inscripciones

- `GET /registrations`
- `GET /registrations/:id`
- `POST /registrations`
- `PUT /registrations/:id`
- `DELETE /registrations/:id`

Campos principales: `id_student`, `id_period`, `registration_date`, `status`.

### Detalles de inscripcion

- `GET /registration-details`
- `GET /registration-details/:id`
- `POST /registration-details`
- `PUT /registration-details/:id`
- `DELETE /registration-details/:id`

Campos principales: `id_registration`, `id_section`, `corte_1`, `corte_2`, `corte_3`, `corte_4`, `recuperatorio`, `final_note`, `attendance_percentage`, `subject_status`.

### Pensums

- `GET /pensums`
- `GET /pensums/:id`
- `POST /pensums`
- `PUT /pensums/:id`
- `DELETE /pensums/:id`

Campos principales: `id_career`, `name_pensum`, `resolution_date`, `is_active`.

### Materias del pensum

- `GET /pensum-subjects`
- `GET /pensum-subjects/:id`
- `POST /pensum-subjects`
- `PUT /pensum-subjects/:id`
- `DELETE /pensum-subjects/:id`

Campos principales: `id_pensum`, `id_subject`, `semester`.

### Prerrequisitos

- `GET /prerequisites`
- `GET /prerequisites/:id`
- `POST /prerequisites`
- `PUT /prerequisites/:id`
- `DELETE /prerequisites/:id`

Campos principales: `id_pensum_subject`, `id_required_pensum_subject`.

### Roles

- `GET /roles`
- `GET /roles/:id`
- `POST /roles`
- `PUT /roles/:id`
- `DELETE /roles/:id`

Campos principales: `name_role`, `description`.

### Periodos academicos

- `GET /periods`
- `GET /periods/:id`
- `POST /periods`
- `PUT /periods/:id`
- `DELETE /periods/:id`

Campos principales: `name_period`, `start_date`, `end_date`, `enrollment_status`, `period_status`.

### Auditoria

- `GET /audit-logs`
- `GET /audit-logs/:id`
- `POST /audit-logs`

Campos principales: `id_user`, `action`, `table_affected`, `record_id`, `old_value`, `new_value`.

### Solicitudes de documentos

- `GET /document-requests`
- `GET /document-requests/:id`
- `POST /document-requests`
- `PUT /document-requests/:id`
- `DELETE /document-requests/:id`

Campos principales: `id_student`, `document_type`, `request_date`, `status`, `hash_verification`.

## Ejemplo de creacion

```bash
curl -X POST http://localhost:3000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"code_subject":"MAT101","name_subject":"Matematica I","credit_units":4}'
```

## Validaciones

Las rutas usan `express-validator` para campos obligatorios y formatos basicos. Revisar cada archivo en `src/routes/` para ver las reglas exactas.