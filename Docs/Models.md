# Modelos

## Resumen

Los modelos usan Sequelize y apuntan a las tablas existentes de PostgreSQL. Las asociaciones estan definidas en `src/models/index.js`.

## Tabla de modelos

| Modelo | Tabla | Campos principales | Proposito |
|---|---|---|---|
| `User` | `user_account` | `id_user`, `id_role`, `document_id`, `username`, `password_hash`, `name`, `lastname`, `email`, `status` | Cuenta de acceso y datos basicos del usuario. |
| `Role` | `role` | `id_role`, `name_role`, `description` | Roles funcionales del sistema. |
| `Career` | `career` | `id_career`, `code_career`, `name_career`, `total_semesters`, `is_active` | Catalogo de carreras. |
| `Subject` | `subject` | `id_subject`, `code_subject`, `name_subject`, `credit_units` | Materias o asignaturas. |
| `Pensum` | `pensum` | `id_pensum`, `id_career`, `name_pensum`, `resolution_date`, `is_active` | Plan de estudios por carrera. |
| `PensumSubject` | `pensum_subject` | `id_pensum_subject`, `id_pensum`, `id_subject`, `semester` | Relacion entre pensum y materias. |
| `SubjectPrerequisite` | `subject_prerequisite` | `id_prerequisite`, `id_pensum_subject`, `id_required_pensum_subject` | Relacion de prerequisitos entre materias del pensum. |
| `AcademicPeriod` | `academic_period` | `id_period`, `name_period`, `start_date`, `end_date`, `enrollment_status`, `period_status` | Periodos academicos e inscripcion. |
| `Section` | `section` | `id_section`, `id_period`, `id_subject`, `id_teacher`, `section_code`, `quota_max`, `classroom`, `schedule_info` | Oferta de una materia en un periodo. |
| `Student` | `student` | `id_student`, `id_user`, `id_career`, `current_semester`, `status`, `admission_date` | Perfil academico del estudiante. |
| `Teacher` | `teacher` | `id_teacher`, `id_user`, `academic_grade`, `profession` | Perfil academico del docente. |
| `Registration` | `registration` | `id_registration`, `id_student`, `id_period`, `registration_date`, `status` | Inscripcion de un estudiante a un periodo. |
| `RegistrationDetail` | `registration_detail` | `id_detail`, `id_registration`, `id_section`, `corte_1`, `corte_2`, `corte_3`, `corte_4`, `recuperatorio`, `final_note`, `attendance_percentage`, `subject_status` | Detalle de materias inscritas y calificaciones. |
| `AuditLog` | `audit_log` | `id_log`, `id_user`, `action`, `table_affected`, `record_id`, `old_value`, `new_value`, `created_at` | Bitacora de cambios. |
| `DocumentRequest` | `document_request` | `id_request`, `id_student`, `document_type`, `request_date`, `status`, `hash_verification` | Solicitudes de documentos academicos. |

## Asociaciones principales

- `Role` tiene muchos `User`.
- `User` pertenece a `Role`.
- `Career` tiene muchos `Pensum`.
- `Pensum` tiene muchas `PensumSubject`.
- `Subject` tiene muchas `PensumSubject` y muchas `Section`.
- `Teacher` tiene muchas `Section`.
- `AcademicPeriod` tiene muchas `Section`.
- `User` tiene un `Student`.
- `Student` tiene muchas `Registration`.
- `Registration` tiene muchos `RegistrationDetail`.
- `Section` tiene muchos `RegistrationDetail`.

## Notas de implementacion

- Las tablas no usan timestamps por defecto, salvo donde el modelo lo indique.
- Algunos campos son `ENUM`, por lo que conviene validar el valor antes de enviar peticiones.
- Las llaves foraneas se manejan desde la capa de relaciones, no desde migraciones visibles en este proyecto.