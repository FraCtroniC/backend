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
const enrollmentStatusSchema = z.enum(['Cerrada', 'Abierta', 'Modificaciones']);
const periodStatusSchema = z.enum(['Planificacion', 'Activo', 'Culminado']);
const documentRequestStatusSchema = z.enum(['Pendiente', 'Generado', 'Rechazado']);

const userCreateSchema = z
  .object({
    id_role: positiveInt,
    document_id: z.string().trim().min(3).max(25),
    username: z.string().trim().min(3).max(50),
    password_hash: z.string().min(6),
    name: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    email: z.string().trim().email(),
    status: userStatusSchema,
  })
  .strict();

const userUpdateSchema = userCreateSchema
  .omit({ document_id: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

const roleCreateSchema = z
  .object({
    name_role: z.string().trim().min(2).max(100),
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
    current_semester: z.coerce.number().int().min(1).max(12),
    status: studentStatusSchema,
    admission_date: isoDate,
  })
  .strict();

const studentUpdateSchema = z
  .object({
    id_career: positiveInt.optional(),
    current_semester: z.coerce.number().int().min(1).max(12).optional(),
    status: studentStatusSchema.optional(),
    admission_date: isoDate.optional(),
  })
  .strict()
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
    name_period: z.string().trim().min(3).max(50),
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
    name: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    email: z.string().trim().email(),
    status: userStatusSchema.optional(),
  })
  .strict();

const authLoginSchema = z
  .object({
    username: z.string().trim().min(3).max(50),
    password: z.string().min(6).max(100),
  })
  .strict();

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
    section_code: z.string().trim().min(1).max(10),
    quota_max: z.coerce.number().int().min(1).max(200),
    classroom: z.string().trim().min(1).max(50),
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
    semester: z.coerce.number().int().min(1).max(12),
  })
  .strict();

const pensumSubjectUpdateSchema = pensumSubjectCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

// Compatibilidad: acepta tanto el contrato nuevo (pensum_subject)
// como el legado (subject) para no romper clientes existentes.
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
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
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
};
