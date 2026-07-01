/** Controlador REST de secciones. */
const { Section, Career, Subject, Teacher, User, AcademicPeriod } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const NotificationService = require('../services/notificationService');
const { checkSectionPeriodLocked } = require('../utils/periodLock');

// Helper to include associations
const includeAssociations = [
  { model: Career },
  { model: Subject },
  { model: AcademicPeriod },
  { model: Teacher, include: [{ model: User }] }
];

// 1. Listar secciones (opcional: filtrar por id_period)
exports.list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.id_period) {
      where.id_period = parseInt(req.query.id_period);
    }
    const sections = await Section.findAll({ 
      where,
      include: includeAssociations,
      order: [['section_code', 'ASC']] 
    });
    res.json(sections);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una sección por ID
exports.get = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id, {
      include: includeAssociations
    });
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }
    res.json(section);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear sección (POST)
exports.create = async (req, res, next) => {
  try {
    const { 
      id_period, 
      id_subject, 
      id_teacher, 
      id_career,
      section_code, 
      quota_max, 
      classroom, 
      schedule_info 
    } = req.body;
    
    const newSection = await Section.create({ 
      id_period, 
      id_subject, 
      id_teacher, 
      id_career,
      section_code, 
      quota_max, 
      classroom, 
      schedule_info 
    });
    
    const populated = await Section.findByPk(newSection.id_section, {
      include: includeAssociations
    });

    try {
      const subjectName = populated.Subject?.name_subject || 'Asignatura';
      const teacherName = populated.Teacher?.User 
        ? `${populated.Teacher.User.first_name} ${populated.Teacher.User.first_lastname}`
        : 'Docente no asignado';
      await logActivity(req, {
        action: 'CREATE',
        tableAffected: 'Sección',
        recordId: newSection.id_section,
        newValue: `Creada sección ${section_code} de ${subjectName}. Docente: ${teacherName}`
      });

      if (id_teacher) {
        await NotificationService.notifyTeacher(id_teacher, 'Nueva Asignación', `Has sido asignado a la sección ${section_code} de la materia ${subjectName}.`, 'info');
      }
    } catch (logErr) {
      console.error('AuditLog section create error:', logErr);
    }

    res.status(201).json(populated);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar sección (PUT)
exports.update = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    const periodCheck = await checkSectionPeriodLocked(section.id_section);
    if (periodCheck.locked) {
      return res.status(400).json({ message: periodCheck.message });
    }

    const { 
      id_period, 
      id_subject, 
      id_teacher, 
      id_career,
      section_code, 
      quota_max, 
      classroom, 
      schedule_info 
    } = req.body;

    await section.update({ 
      id_period, 
      id_subject, 
      id_teacher, 
      id_career,
      section_code, 
      quota_max, 
      classroom, 
      schedule_info 
    });

    const populated = await Section.findByPk(section.id_section, {
      include: includeAssociations
    });

    try {
      const subjectName = populated.Subject?.name_subject || 'Asignatura';
      const teacherName = populated.Teacher?.User 
        ? `${populated.Teacher.User.first_name} ${populated.Teacher.User.first_lastname}`
        : 'Docente no asignado';
      
      let newValue = `Sección ${populated.section_code} de ${subjectName} actualizada.`;
      if (id_teacher && id_teacher !== section.id_teacher) {
        newValue = `Docente ${teacherName} asignado a la sección ${populated.section_code} de ${subjectName}`;
        await NotificationService.notifyTeacher(id_teacher, 'Nueva Asignación', `Has sido asignado a la sección ${populated.section_code} de la materia ${subjectName}.`, 'info');
      }
      
      await logActivity(req, {
        action: 'UPDATE',
        tableAffected: 'Sección',
        recordId: section.id_section,
        newValue
      });
    } catch (logErr) {
      console.error('AuditLog section update error:', logErr);
    }

    res.json(populated);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar sección (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id, {
      include: includeAssociations
    });
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }

    const periodCheck = await checkSectionPeriodLocked(section.id_section);
    if (periodCheck.locked) {
      return res.status(400).json({ message: periodCheck.message });
    }
    
    const secCode = section.section_code;
    const subjectName = section.Subject?.name_subject || 'Asignatura';

    await section.destroy();

    try {
      await logActivity(req, {
        action: 'DELETE',
        tableAffected: 'Sección',
        recordId: req.params.id,
        newValue: `Eliminada sección ${secCode} de la asignatura ${subjectName}`
      });
    } catch (logErr) {
      console.error('AuditLog section delete error:', logErr);
    }

    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};