/**
 * Catálogo centralizado de módulos y permisos para SGUMS.
 * Los nombres (label) coinciden exactamente con los nombres originales del menú/sidebar.
 */

const MODULE_PERMISSIONS = [
  // Módulos Administrativos
  { id: 'admin:dashboard', label: 'Dashboard', category: 'Administración General', role: 'admin' },
  { id: 'admin:users', label: 'Usuarios', category: 'Administración General', role: 'admin' },
  { id: 'admin:periods', label: 'Períodos', category: 'Administración General', role: 'admin' },
  { id: 'admin:history', label: 'Historial', category: 'Administración General', role: 'admin' },

  // Gestión Académica
  { id: 'admin:careers', label: 'Carreras', category: 'Gestión Académica', role: 'admin' },
  { id: 'admin:pensum', label: 'Pensum', category: 'Gestión Académica', role: 'admin' },
  { id: 'admin:sections', label: 'Secciones', category: 'Gestión Académica', role: 'admin' },
  { id: 'admin:classrooms', label: 'Aulas y Espacios', category: 'Gestión Académica', role: 'admin' },
  { id: 'admin:teacher-assignment', label: 'Asignación Docente', category: 'Gestión Académica', role: 'admin' },

  // Control de Estudios
  { id: 'admin:enrollments', label: 'Inscripciones', category: 'Control de Estudios', role: 'admin' },
  { id: 'admin:grades', label: 'Notas', category: 'Control de Estudios', role: 'admin' },
  { id: 'admin:pre-registrations', label: 'Aspirantes', category: 'Control de Estudios', role: 'admin' },

  // Módulos Docentes
  { id: 'teacher:dashboard', label: 'Dashboard', category: 'Docencia', role: 'teacher' },
  { id: 'teacher:subjects', label: 'Asignaturas Impartidas', category: 'Docencia', role: 'teacher' },
  { id: 'teacher:students', label: 'Estudiantes Inscritos', category: 'Docencia', role: 'teacher' },
  { id: 'teacher:records', label: 'Cerrar Actas', category: 'Docencia', role: 'teacher' },
  { id: 'teacher:history', label: 'Historial Impartido', category: 'Docencia', role: 'teacher' },

  // Módulos Estudiantes
  { id: 'student:dashboard', label: 'Dashboard', category: 'Estudiantes', role: 'student' },
  { id: 'student:profile', label: 'Datos Personales', category: 'Estudiantes', role: 'student' },
  { id: 'student:pensum', label: 'Pensum de Estudios', category: 'Estudiantes', role: 'student' },
  { id: 'student:enrollment', label: 'Inscripción de Materias', category: 'Estudiantes', role: 'student' },
  { id: 'student:schedule', label: 'Mi Horario', category: 'Estudiantes', role: 'student' },
  { id: 'student:record', label: 'Récord Académico', category: 'Estudiantes', role: 'student' },
  { id: 'student:documents', label: 'Constancias y Reportes', category: 'Estudiantes', role: 'student' }
];

const DEFAULT_ROLE_PERMISSIONS = {
  admin: MODULE_PERMISSIONS.filter(m => m.role === 'admin').map(m => m.id),
  teacher: MODULE_PERMISSIONS.filter(m => m.role === 'teacher').map(m => m.id),
  student: MODULE_PERMISSIONS.filter(m => m.role === 'student').map(m => m.id),
  control_estudios: ['admin:dashboard', 'admin:enrollments', 'admin:grades', 'admin:pre-registrations'],
  gestion_academica: ['admin:dashboard', 'admin:careers', 'admin:pensum', 'admin:sections', 'admin:classrooms', 'admin:teacher-assignment']
};

module.exports = {
  MODULE_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS
};
