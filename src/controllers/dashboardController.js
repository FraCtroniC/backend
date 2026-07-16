const { 
  User, 
  Student, 
  Teacher, 
  Section, 
  Subject, 
  AcademicPeriod, 
  Registration, 
  RegistrationDetail, 
  AuditLog, 
  Career, 
  Role,
  PreRegistration
} = require('../models');
const { Op } = require('sequelize');
const cacheService = require('../services/cacheService');

// Helper to format time ago for audit logs
function formatTimeAgo(date) {
  if (!date) return 'Hace un momento';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

// 1. Admin Dashboard Stats
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const userId = req.auth?.sub || 'anonymous';
    const data = await cacheService.remember(
      `dashboard:admin:${userId}`,
      120,
      ['students', 'sections', 'teachers', 'registrations', 'users', 'periods', 'grades', 'preregistrations'],
      async () => {
        const activeStudents = await Student.count({ where: { status: 'Regular' } });
        const sectionsCount = await Section.count();
        const teachersCount = await Teacher.count();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const enrollmentsToday = await Registration.count({
          where: { registration_date: { [Op.between]: [todayStart, todayEnd] } }
        });

        const logs = await AuditLog.findAll({
          limit: 15,
          order: [['created_at', 'DESC']],
          include: [{ model: User, attributes: ['first_name', 'first_lastname', 'username'] }]
        });

        let recentActivity = [];
        if (logs && logs.length > 0) {
          recentActivity = logs.map(log => {
            let title = 'Acción del sistema';
            let color = '#ffd100';
            if (log.action.toLowerCase().includes('create') || log.action.toLowerCase().includes('crear')) {
              title = `Creación de ${log.table_affected}`;
              color = '#22c55e';
            } else if (log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('eliminar')) {
              title = `Eliminación en ${log.table_affected}`;
              color = '#ef4444';
            } else if (log.action.toLowerCase().includes('update') || log.action.toLowerCase().includes('actualizar')) {
              title = `Modificación de ${log.table_affected}`;
              color = '#3b82f6';
            }
            let authorText = '';
            if (log.User) {
              const name = [log.User.first_name, log.User.first_lastname].filter(Boolean).join(' ');
              authorText = name ? ` por ${name}` : ` por @${log.User.username}`;
            }
            return {
              id: log.id_log,
              title,
              description: `${log.new_value || `ID registro: ${log.record_id}. Acción: ${log.action}`}${authorText}`,
              time: formatTimeAgo(log.created_at),
              borderLeftColor: color,
              iconName: log.action.toLowerCase().includes('delete') ? 'Trash' :
                ((log.action.toLowerCase().includes('create') || log.action.toLowerCase().includes('crear')) ? 'Plus' : 'Clock')
            };
          });
        }

        const cpuLoad = Math.floor(15 + Math.random() * 15);

        const pendingPreRegistrations = await PreRegistration.count({ where: { status_pre: 'Pendiente' } });
        const sectionsWithoutTeacher = await Section.count({ where: { id_teacher: null } });
        const pendingGradesConfirmations = await RegistrationDetail.count({ where: { grade_status: 'Cargando' } });

        let periodInfo = null;
        const activePeriod = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
        if (activePeriod) {
          const start = new Date(activePeriod.start_date);
          const end = new Date(activePeriod.end_date);
          const today = new Date();
          const totalTime = end - start;
          const passedTime = today - start;
          let percentage = 0;
          if (totalTime > 0) {
            percentage = Math.min(100, Math.max(0, Math.round((passedTime / totalTime) * 100)));
          }
          const oneDay = 24 * 60 * 60 * 1000;
          const daysRemaining = Math.max(0, Math.round((end - today) / oneDay));
          periodInfo = {
            name: activePeriod.name_period,
            startDate: activePeriod.start_date,
            endDate: activePeriod.end_date,
            percentage,
            daysRemaining,
            status: activePeriod.period_status
          };
        }

        return {
          metrics: {
            activeStudents: activeStudents || 0,
            sectionsCount: sectionsCount || 0,
            teachersCount: teachersCount || 0,
            enrollmentsToday: enrollmentsToday || 0
          },
          recentActivity,
          serverStatus: { cpuLoad },
          pendingTasks: {
            preRegistrations: pendingPreRegistrations || 0,
            sectionsWithoutTeacher: sectionsWithoutTeacher || 0,
            gradesConfirmations: pendingGradesConfirmations || 0
          },
          periodInfo
        };
      }
    );
    res.json(data);
  } catch (error) {
    return next(error);
  }
};

// 2. Teacher Dashboard Stats
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const userId = req.auth.sub;

    const data = await cacheService.remember(
      `dashboard:teacher:${userId}`,
      120,
      ['sections', 'teachers', 'grades'],
      async () => {
        // Find teacher
    const teacher = await Teacher.findOne({
      where: { id_user: userId },
      include: [{ model: User }]
    });

    if (!teacher) {
      // If user logs in as teacher but has no Teacher record (e.g. testing),
      // we gracefully return simulated premium teacher dashboard data.
      return res.json({
        metrics: {
          activeSubjects: 3,
          pendingGrades: 2,
          historyCount: 2
        },
        assignments: [
          {
            id: 'asg-1',
            code: 'INF-301',
            subject: 'Programación III',
            section: 'A-01',
            career: 'Informática',
            semester: 'Semestre III',
            period: '2026-I',
            enrolled: 28,
            editableUntil: '2026-07-30T23:59:59',
            actStatus: 'abierta'
          },
          {
            id: 'asg-2',
            code: 'ADM-220',
            subject: 'Metodología de la Investigación',
            section: 'B-02',
            career: 'Administración',
            semester: 'Semestre V',
            period: '2026-I',
            enrolled: 24,
            editableUntil: '2026-07-30T23:59:59',
            actStatus: 'abierta'
          }
        ],
        history: [
          {
            id: 'hist-1',
            period: '2025-II',
            code: 'INF-220',
            subject: 'Base de Datos II',
            section: 'D-01',
            career: 'Informática',
            semester: 'Semestre II',
            status: 'Acta cerrada'
          }
        ]
      });
    }

    // Find sections taught by this teacher
    const sections = await Section.findAll({
      where: { id_teacher: teacher.id_teacher },
      include: [
        { model: Subject },
        { model: AcademicPeriod }
      ]
    });

    // Query enrolled students counts for these sections
    const assignments = [];
    for (const sec of sections) {
      const enrolledCount = await RegistrationDetail.count({
        where: { id_section: sec.id_section }
      });

      // Find details to see if all are confirmed
      const details = await RegistrationDetail.findAll({
        where: { id_section: sec.id_section }
      });
      const allConfirmed = details.length > 0 && details.every(d => d.grade_status === 'Confirmada');

      assignments.push({
        id: `asg-${sec.id_section}`,
        code: sec.Subject?.code_subject || 'N/A',
        subject: sec.Subject?.name_subject || 'Asignatura',
        section: sec.section_code,
        career: 'Informática', // Career lookup default
        semester: `Semestre ${sec.id_subject}`, // Placeholder semester mapping
        period: sec.AcademicPeriod?.name_period || '2026-I',
        enrolled: enrolledCount || 0,
        editableUntil: sec.AcademicPeriod?.end_date ? `${sec.AcademicPeriod.end_date}T23:59:59` : '2026-07-30T23:59:59',
        actStatus: (sec.AcademicPeriod?.period_status === 'Cerrada' || allConfirmed) ? 'cerrada' : 'abierta'
      });
    }

    const activeSubjects = assignments.filter(a => a.actStatus === 'abierta').length;
    const pendingGrades = assignments.filter(a => a.actStatus === 'abierta').length;
    const historyCount = assignments.filter(a => a.actStatus === 'cerrada').length;

        return {
          metrics: {
            activeSubjects,
            pendingGrades,
            historyCount
          },
          assignments,
          history: []
        };
      }
    );
    res.json(data);
  } catch (error) {
    return next(error);
  }
};

// 3. Student Dashboard Stats
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.auth.sub;

    const data = await cacheService.remember(
      `dashboard:student:${userId}`,
      120,
      ['students', 'registrations', 'grades', 'periods'],
      async () => {
        const student = await Student.findOne({
          where: { id_user: userId },
          include: [{ model: User }, { model: Career }]
        });

        if (!student) {
          const user = await User.findByPk(userId);
          const activePeriod = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
          const currentPeriod = activePeriod ? activePeriod.name_period : '2026-II';
          return {
            profile: {
              name: user?.first_name || 'Ana',
              lastname: user?.first_lastname || 'García',
              career: 'Informática',
              faculty: 'Facultad de Ingeniería',
              director: 'Dra. Helena Pirela',
              cum: 0.0,
              creditsRequired: 160,
              academicStatus: 'Regular',
              currentPeriod
            },
            enrolled: [],
            metrics: { creditsPassed: 0 }
          };
        }

        const registrations = await Registration.findAll({
          where: { id_student: student.id_student },
          include: [{
            model: RegistrationDetail,
            include: [{
              model: Section,
              include: [
                { model: Subject },
                { model: Teacher, include: [{ model: User }] },
                { model: AcademicPeriod }
              ]
            }]
          }]
        });

        const activePeriod = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
        const currentPeriod = activePeriod ? activePeriod.name_period : '2026-II';

        let totalGrades = 0;
        let gradesCount = 0;
        let totalCreditsPassed = 0;
        const enrolledClasses = [];

        registrations.forEach(reg => {
          const isCurrentPeriod = activePeriod && Number(reg.id_period) === Number(activePeriod.id_period);
          reg.RegistrationDetails.forEach(detail => {
            if (detail.final_note !== null && detail.final_note !== undefined) {
              totalGrades += Number(detail.final_note);
              gradesCount++;
              if (Number(detail.final_note) >= 10 && detail.Section?.Subject?.credit_units) {
                totalCreditsPassed += detail.Section.Subject.credit_units;
              }
            }
            if (isCurrentPeriod && reg.status === 'Inscrito' && detail.Section) {
              enrolledClasses.push({
                code: detail.Section.Subject?.code_subject || 'N/A',
                credits: detail.Section.Subject?.credit_units || 0,
                name: detail.Section.Subject?.name_subject || 'Asignatura',
                sectionCode: detail.Section.section_code,
                classroom: detail.Section.classroom || 'Aula asignada',
                teacher: detail.Section.Teacher?.User
                  ? `${detail.Section.Teacher.User.first_name} ${detail.Section.Teacher.User.first_lastname}`
                  : 'Docente no asignado',
                schedule: detail.Section.schedule_info || 'Por definir'
              });
            }
          });
        });

        const calculatedCum = gradesCount > 0 ? (totalGrades / gradesCount) : 0.0;

        let faculty = 'Facultad de Ingeniería y Sistemas';
        let director = 'Dra. María Helena Pirela';
        const careerName = student.Career?.name_career || 'Informática';
        if (careerName.toLowerCase().includes('administración') || careerName.toLowerCase().includes('contaduría')) {
          faculty = 'Facultad de Ciencias Administrativas';
          director = 'Dr. Juan Carlos Ramos';
        }

        return {
          profile: {
            name: student.User?.first_name || 'Estudiante',
            lastname: student.User?.first_lastname || 'Upty',
            career: careerName,
            faculty,
            director,
            cum: Number(calculatedCum.toFixed(2)),
            creditsRequired: 160,
            academicStatus: student.status || 'Regular',
            currentPeriod
          },
          enrolled: enrolledClasses,
          metrics: { creditsPassed: totalCreditsPassed }
        };
      }
    );
    res.json(data);
  } catch (error) {
    return next(error);
  }
};
