const {
  z,
  positiveInt,
  uuid,
  isoDate,
} = require('./commonSchemas');

const userStatusSchema = z.enum(['Activo', 'Inactivo', 'Bloqueado']);
const studentStatusSchema = z.enum(['Regular', 'Retirado', 'Egresado', 'Suspendido']);
const registrationStatusSchema = z.enum(['Inscrito', 'Retirado']);
const subjectStatusSchema = z.enum(['Cursando', 'Aprobado', 'Reprobado', 'Retirado']);
const enrollmentStatusSchema = z.enum(['Planificacion', 'Activo', 'Culminado', 'Cerrada', 'Abierta', 'Modificaciones']);
const periodStatusSchema = z.enum(['Cerrada', 'Abierta', 'Modificaciones', 'Planificacion', 'Activo', 'Culminado']);
const documentRequestStatusSchema = z.enum(['Emitido', 'Anulado']);
const roleNameSchema = z.enum(['Admin', 'Docente', 'Estudiante']);

function mapLegacyNameFields(value) {
  const mapped = { ...value };

  if (mapped.first_name === undefined && mapped.name !== undefined) {
    mapped.first_name = mapped.name;
  }

  if (mapped.first_lastname === undefined && mapped.lastname !== undefined) {
    mapped.first_lastname = mapped.lastname;
  }

  return mapped;
}

const userBaseNameSchema = {
  first_name: z.string().trim().min(1).max(50).optional(),
  second_name: z.string().trim().max(50).optional(),
  first_lastname: z.string().trim().min(1).max(50).optional(),
  second_lastname: z.string().trim().max(50).optional(),
  name: z.string().trim().min(1).max(50).optional(),
  lastname: z.string().trim().min(1).max(50).optional(),
};

const userCreateSchema = z
  .object({
    id_role: positiveInt.optional(),
    document_id: z.string().trim().min(3).max(25),
    username: z.string().trim().min(3).max(50),
    password_hash: z.string().min(6),
    ...userBaseNameSchema,
    email: z.string().trim().email().optional().nullable(),
    phone: z.string().trim().max(25).optional(),
    date_birth: z.string().optional().or(z.null()),
    status: userStatusSchema.optional(),
    career: z.string().optional().nullable(),
    academic_grade: z.string().optional().nullable(),
    profession: z.string().optional().nullable(),
  })
  .strict()
  .transform(mapLegacyNameFields)
  .superRefine((value, ctx) => {
    if (!value.first_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['first_name'],
        message: 'Debe enviar first_name (o name para compatibilidad)',
      });
    }

    if (!value.first_lastname) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['first_lastname'],
        message: 'Debe enviar first_lastname (o lastname para compatibilidad)',
      });
    }
  });

const userUpdateSchema = z
  .object({
    id_role: positiveInt.optional(),
    username: z.string().trim().min(3).max(50).optional(),
    password_hash: z.string().min(6).optional(),
    ...userBaseNameSchema,
    email: z.string().trim().email().optional().nullable(),
    phone: z.string().trim().max(25).optional(),
    date_birth: z.string().optional().or(z.null()),
    status: userStatusSchema.optional(),
  })
  .strict()
  .transform(mapLegacyNameFields)
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const roleCreateSchema = z
  .object({
    name_role: roleNameSchema,
    description: z.string().trim().max(255).optional(),
  })
  .strict();

const roleUpdateSchema = roleCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const studentCreateSchema = z
  .object({
    id_user: uuid,
    id_career: positiveInt,
    id_semester: z.coerce.number().int().min(1).max(20).optional(),
    current_semester: z.coerce.number().int().min(1).max(20).optional(),
    status: studentStatusSchema,
    admission_date: isoDate,
  })
  .strict()
  .transform((value) => ({
    ...value,
    id_semester: value.id_semester ?? value.current_semester,
  }))
  .superRefine((value, ctx) => {
    if (!value.id_semester) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['id_semester'],
        message: 'Debe enviar id_semester (o current_semester para compatibilidad)',
      });
    }
  });

const studentUpdateSchema = z
  .object({
    id_career: positiveInt.optional(),
    id_semester: z.coerce.number().int().min(1).max(20).optional(),
    current_semester: z.coerce.number().int().min(1).max(20).optional(),
    status: studentStatusSchema.optional(),
    admission_date: isoDate.optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    id_semester: value.id_semester ?? value.current_semester,
  }))
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const registrationCreateSchema = z
  .object({
    id_student: positiveInt,
    id_period: positiveInt,
    registration_date: z.string().datetime().optional(),
    status: registrationStatusSchema,
  })
  .strict();

const registrationUpdateSchema = registrationCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const academicPeriodBaseSchema = z
  .object({
    name_period: z.string().trim().min(3).max(255),
    start_date: isoDate,
    end_date: isoDate,
    enrollment_status: enrollmentStatusSchema,
    period_status: periodStatusSchema,
  })
  .strict();

const academicPeriodCreateSchema = academicPeriodBaseSchema
  .refine((value) => value.start_date <= value.end_date, {
    message: 'start_date no puede ser mayor que end_date',
    path: ['end_date'],
  });

const academicPeriodUpdateSchema = academicPeriodBaseSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const auditLogCreateSchema = z
  .object({
    id_user: uuid,
    action: z.string().trim().min(3).max(50),
    table_affected: z.string().trim().min(2).max(50),
    record_id: z.string().trim().min(1),
    old_value: z.string().optional().nullable(),
    new_value: z.string().optional().nullable(),
  })
  .strict();

const documentRequestCreateSchema = z
  .object({
    id_student: positiveInt,
    document_type: z.string().trim().min(3).max(50),
    request_date: z.string().datetime().optional(),
    status: documentRequestStatusSchema.optional(),
    hash_verification: z.string().trim().max(255).optional(),
  })
  .strict();

const documentRequestUpdateSchema = documentRequestCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const tokenIssueSchema = z
  .object({
    sub: z.string().trim().min(1),
    role: z.string().trim().min(2).max(50).optional(),
    expiresIn: z.string().trim().min(2).max(20).optional(),
  })
  .strict();

const authRegisterSchema = z
  .object({
    id_role: positiveInt.optional(),
    document_id: z.string().trim().min(3).max(25),
    username: z.string().trim().min(3).max(50),
    password: z.string().min(6).max(100),
    ...userBaseNameSchema,
    email: z.string().trim().email().optional().nullable(),
    date_birth: z.string().optional().or(z.null()),
    phone: z.string().trim().max(25).optional(),
    status: userStatusSchema.optional(),
    career: z.string().optional().nullable(),
    academic_grade: z.string().optional().nullable(),
    profession: z.string().optional().nullable(),
  })
  .strict()
  .transform(mapLegacyNameFields)
  .superRefine((value, ctx) => {
    if (!value.first_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['first_name'],
        message: 'Debe enviar first_name (o name para compatibilidad)',
      });
    }

    if (!value.first_lastname) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['first_lastname'],
        message: 'Debe enviar first_lastname (o lastname para compatibilidad)',
      });
    }
  });

const authLoginSchema = z
  .object({
    username: z.string().trim().min(3).max(50),
    password: z.string().min(6).max(100),
  })
  .strict();

const profileUpdateSchema = z
  .object({
    email: z.string().trim().email().optional(),
    ...userBaseNameSchema,
    phone: z.string().trim().max(25).optional(),
  })
  .strict()
  .transform(mapLegacyNameFields)
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email(),
  })
  .strict();

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'La confirmacion no coincide con la nueva contrasena',
      });
    }
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6).max(100),
    newPassword: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'La confirmacion no coincide con la nueva contrasena',
      });
    }
  });

const careerCreateSchema = z
  .object({
    code_career: z.string().trim().min(2).max(20),
    name_career: z.string().trim().min(3).max(100),
    total_semesters: z.coerce.number().int().min(1).max(20),
    is_active: z.boolean().optional(),
  })
  .strict();

const careerUpdateSchema = careerCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const subjectCreateSchema = z
  .object({
    code_subject: z.string().trim().min(2).max(20),
    name_subject: z.string().trim().min(3).max(100),
    credit_units: z.coerce.number().int().min(1).max(20),
  })
  .strict();

const subjectUpdateSchema = subjectCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const sectionCreateSchema = z
  .object({
    id_period: positiveInt,
    id_subject: positiveInt,
    id_teacher: positiveInt,
    id_career: positiveInt,
    section_code: z.string().trim().min(1).max(10),
    quota_max: z.coerce.number().int().min(1).max(200),
    classroom: z.string().trim().min(1).max(50).optional(),
    schedule_info: z.string().trim().max(100).optional(),
  })
  .strict();

const sectionUpdateSchema = sectionCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const teacherCreateSchema = z
  .object({
    id_user: uuid,
    academic_grade: z.string().trim().max(20).optional(),
    profession: z.string().trim().max(100).optional(),
  })
  .strict();

const teacherUpdateSchema = z
  .object({
    academic_grade: z.string().trim().max(20).optional(),
    profession: z.string().trim().max(100).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const pensumCreateSchema = z
  .object({
    id_career: positiveInt,
    name_pensum: z.string().trim().min(3).max(50),
    resolution_date: isoDate.optional(),
    is_active: z.boolean(),
  })
  .strict();

const pensumUpdateSchema = pensumCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const pensumSubjectCreateSchema = z
  .object({
    id_pensum: positiveInt,
    id_subject: positiveInt,
    id_semester: z.coerce.number().int().min(1).max(20).optional(),
    semester: z.coerce.number().int().min(1).max(20).optional(),
    code_subject: z.string().trim().min(2).max(20),
  })
  .strict()
  .transform((value) => ({
    ...value,
    id_semester: value.id_semester ?? value.semester,
  }))
  .superRefine((value, ctx) => {
    if (!value.id_semester) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['id_semester'],
        message: 'Debe enviar id_semester (o semester para compatibilidad)',
      });
    }
  });

const pensumSubjectUpdateSchema = z
  .object({
    id_pensum: positiveInt.optional(),
    id_subject: positiveInt.optional(),
    id_semester: z.coerce.number().int().min(1).max(20).optional(),
    semester: z.coerce.number().int().min(1).max(20).optional(),
    code_subject: z.string().trim().min(2).max(20).optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    id_semester: value.id_semester ?? value.semester,
  }))
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const subjectPrerequisiteBaseSchema = z
  .object({
    id_pensum_subject: positiveInt.optional(),
    id_required_pensum_subject: positiveInt.optional(),
    id_subject: positiveInt.optional(),
    id_prerequisite_subject: positiveInt.optional(),
    type: z.string().trim().max(50).optional(),
  })
  .strict();

const subjectPrerequisiteCreateSchema = subjectPrerequisiteBaseSchema.refine((value) => {
  const hasNewPair = value.id_pensum_subject !== undefined && value.id_required_pensum_subject !== undefined;
  const hasLegacyPair = value.id_subject !== undefined && value.id_prerequisite_subject !== undefined;
  return hasNewPair || hasLegacyPair;
}, {
  message: 'Debe enviar id_pensum_subject + id_required_pensum_subject o id_subject + id_prerequisite_subject',
});

const subjectPrerequisiteUpdateSchema = subjectPrerequisiteBaseSchema.refine((value) => {
  return Object.keys(value).length > 0;
}, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const gradeSchema = z.coerce.number().min(0).max(20);

const registrationDetailCreateSchema = z
  .object({
    id_registration: positiveInt,
    id_section: positiveInt,
    corte_1: gradeSchema.optional(),
    corte_2: gradeSchema.optional(),
    corte_3: gradeSchema.optional(),
    corte_4: gradeSchema.optional(),
    recuperatorio: gradeSchema.optional(),
    final_note: gradeSchema.optional(),
    attendance_percentage: z.coerce.number().int().min(0).max(100).optional(),
    subject_status: subjectStatusSchema,
    grade_status: z.enum(['Cargando', 'Confirmada']).optional(),
  })
  .strict();

const registrationDetailUpdateSchema = z
  .object({
    corte_1: gradeSchema.optional(),
    corte_2: gradeSchema.optional(),
    corte_3: gradeSchema.optional(),
    corte_4: gradeSchema.optional(),
    recuperatorio: gradeSchema.optional(),
    final_note: gradeSchema.optional(),
    attendance_percentage: z.coerce.number().int().min(0).max(100).optional(),
    subject_status: subjectStatusSchema.optional(),
    grade_status: z.enum(['Cargando', 'Confirmada']).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const semesterCreateSchema = z
  .object({
    name_semester: z.string().trim().min(2).max(30),
    number_semester: z.coerce.number().int().min(1).max(20),
  })
  .strict();

const semesterUpdateSchema = semesterCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const stateCreateSchema = z
  .object({
    name_state: z.string().trim().min(2).max(50),
  })
  .strict();

const stateUpdateSchema = stateCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const municipalityCreateSchema = z
  .object({
    id_state: positiveInt,
    name_municipality: z.string().trim().min(2).max(100),
  })
  .strict();

const municipalityUpdateSchema = municipalityCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const parishCreateSchema = z
  .object({
    id_municipality: positiveInt,
    name_parish: z.string().trim().min(2).max(100),
  })
  .strict();

const parishUpdateSchema = parishCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const preRegistrationCreateSchema = z
  .object({
    first_name: z.string().trim().min(1).max(50),
    second_name: z.string().trim().max(50).optional(),
    first_lastname: z.string().trim().min(1).max(50),
    second_lastname: z.string().trim().max(50).optional(),
    nationality: z.string().trim().min(1).max(20),
    document_type: z.string().trim().length(1),
    document_id: z.string().trim().min(3).max(25),
    birth_date: isoDate,
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(20),
    id_state: positiveInt,
    id_municipality: positiveInt,
    id_parish: positiveInt,
    full_address: z.string().trim().min(5),
    entry_mode: z.string().trim().min(2).max(100),
    academic_area: z.string().trim().max(100).optional(),
    id_career: positiveInt,
    id_semester: positiveInt.optional(),
    inst_procedencia: z.string().trim().max(150).optional(),
    inst_type: z.string().trim().max(50).optional(),
    grad_year: z.coerce.number().int().min(1950).max(2100).optional(),
    observations: z.string().optional(),
    status_pre: z.enum(['Pendiente', 'En Revisión', 'Aprobado', 'Rechazado']).optional(),
    confirmo_info: z.boolean().optional(),
    autorizo_datos: z.boolean().optional(),
    verification_code: z.string().trim().max(12).optional(),
  })
  .strict();

const preRegistrationUpdateSchema = preRegistrationCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

const preDocumentCreateSchema = z
  .object({
    id_pre: positiveInt,
    document_type: z.string().trim().min(2).max(100),
    file_path: z.string().trim().min(3).max(255),
    is_verified: z.boolean().optional(),
  })
  .strict();

const preDocumentUpdateSchema = preDocumentCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
});

module.exports = {
  userCreateSchema,
  userUpdateSchema,
  roleCreateSchema,
  roleUpdateSchema,
  studentCreateSchema,
  studentUpdateSchema,
  registrationCreateSchema,
  registrationUpdateSchema,
  academicPeriodCreateSchema,
  academicPeriodUpdateSchema,
  auditLogCreateSchema,
  documentRequestCreateSchema,
  documentRequestUpdateSchema,
  tokenIssueSchema,
  authRegisterSchema,
  authLoginSchema,
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  userStatusSchema,
  studentStatusSchema,
  registrationStatusSchema,
  subjectStatusSchema,
  enrollmentStatusSchema,
  periodStatusSchema,
  documentRequestStatusSchema,
  careerCreateSchema,
  careerUpdateSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  sectionCreateSchema,
  sectionUpdateSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
  pensumCreateSchema,
  pensumUpdateSchema,
  pensumSubjectCreateSchema,
  pensumSubjectUpdateSchema,
  subjectPrerequisiteCreateSchema,
  subjectPrerequisiteUpdateSchema,
  registrationDetailCreateSchema,
  registrationDetailUpdateSchema,
  semesterCreateSchema,
  semesterUpdateSchema,
  stateCreateSchema,
  stateUpdateSchema,
  municipalityCreateSchema,
  municipalityUpdateSchema,
  parishCreateSchema,
  parishUpdateSchema,
  preRegistrationCreateSchema,
  preRegistrationUpdateSchema,
  preDocumentCreateSchema,
  preDocumentUpdateSchema,
};