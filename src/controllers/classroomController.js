const { Classroom, Section, Subject, Teacher, User, AcademicPeriod } = require('../models');
const { Op } = require('sequelize');
const { logActivity } = require('../utils/auditLogger');
const cacheService = require('../services/cacheService');

// 1. Listar todas las aulas con filtros opcionales
exports.list = async (req, res, next) => {
  try {
    const { status, building, classroom_type, search } = req.query;
    const where = {};

    if (status && status !== 'Todos') {
      where.status = status;
    }
    if (building && building !== 'Todos') {
      where.building = building;
    }
    if (classroom_type && classroom_type !== 'Todos') {
      where.classroom_type = classroom_type;
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { code_classroom: { [Op.iLike]: q } },
        { name_classroom: { [Op.iLike]: q } },
        { building: { [Op.iLike]: q } },
        { resources: { [Op.iLike]: q } }
      ];
    }

    const classrooms = await Classroom.findAll({
      where,
      order: [
        ['building', 'ASC'],
        ['name_classroom', 'ASC']
      ]
    });

    res.json(classrooms);
  } catch (err) {
    next(err);
  }
};

// 2. Obtener aula individual por ID
exports.get = async (req, res, next) => {
  try {
    const item = await Classroom.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Aula no encontrada' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 3. Crear nueva aula
exports.create = async (req, res, next) => {
  try {
    const {
      code_classroom,
      name_classroom,
      building,
      floor,
      capacity,
      classroom_type,
      status,
      resources,
      notes
    } = req.body;

    if (!code_classroom || !name_classroom) {
      return res.status(400).json({ message: 'El código y nombre del aula son obligatorios.' });
    }

    const existing = await Classroom.findOne({
      where: { code_classroom: code_classroom.trim().toUpperCase() }
    });
    if (existing) {
      return res.status(400).json({ message: `Ya existe un aula con el código "${code_classroom}".` });
    }

    const newClassroom = await Classroom.create({
      code_classroom: code_classroom.trim().toUpperCase(),
      name_classroom: name_classroom.trim(),
      building: building?.trim() || 'Edificio Central',
      floor: floor?.trim() || 'Planta Baja',
      capacity: Number(capacity) || 30,
      classroom_type: classroom_type || 'Teoría',
      status: status || 'Disponible',
      resources: resources?.trim() || null,
      notes: notes?.trim() || null
    });

    try {
      await logActivity(req, {
        action: 'CREATE',
        tableAffected: 'Aula',
        recordId: newClassroom.id_classroom,
        newValue: `Creada aula ${newClassroom.code_classroom} - ${newClassroom.name_classroom} (${newClassroom.building}, Capacidad: ${newClassroom.capacity})`
      });
    } catch (logErr) {
      console.error('AuditLog classroom create error:', logErr);
    }

    await cacheService.invalidateTags(['classrooms', 'sections']);
    res.status(201).json(newClassroom);
  } catch (err) {
    next(err);
  }
};

// 4. Actualizar aula
exports.update = async (req, res, next) => {
  try {
    const item = await Classroom.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Aula no encontrada' });
    }

    const {
      code_classroom,
      name_classroom,
      building,
      floor,
      capacity,
      classroom_type,
      status,
      resources,
      notes
    } = req.body;

    if (code_classroom && code_classroom.trim().toUpperCase() !== item.code_classroom) {
      const existing = await Classroom.findOne({
        where: {
          code_classroom: code_classroom.trim().toUpperCase(),
          id_classroom: { [Op.ne]: item.id_classroom }
        }
      });
      if (existing) {
        return res.status(400).json({ message: `El código "${code_classroom}" ya está en uso por otra aula.` });
      }
    }

    await item.update({
      code_classroom: code_classroom ? code_classroom.trim().toUpperCase() : item.code_classroom,
      name_classroom: name_classroom ? name_classroom.trim() : item.name_classroom,
      building: building ? building.trim() : item.building,
      floor: floor ? floor.trim() : item.floor,
      capacity: capacity !== undefined ? Number(capacity) : item.capacity,
      classroom_type: classroom_type || item.classroom_type,
      status: status || item.status,
      resources: resources !== undefined ? resources?.trim() : item.resources,
      notes: notes !== undefined ? notes?.trim() : item.notes
    });

    try {
      await logActivity(req, {
        action: 'UPDATE',
        tableAffected: 'Aula',
        recordId: item.id_classroom,
        newValue: `Actualizada aula ${item.code_classroom} - ${item.name_classroom}. Estado: ${item.status}`
      });
    } catch (logErr) {
      console.error('AuditLog classroom update error:', logErr);
    }

    await cacheService.invalidateTags(['classrooms', 'sections']);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 5. Eliminar aula
exports.remove = async (req, res, next) => {
  try {
    const item = await Classroom.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Aula no encontrada' });
    }

    // Verificar si hay secciones asignadas a este nombre o código de aula
    const activeSections = await Section.count({
      where: {
        [Op.or]: [
          { classroom: item.name_classroom },
          { classroom: item.code_classroom }
        ]
      }
    });

    if (activeSections > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el aula "${item.name_classroom}" porque tiene ${activeSections} sección(es) asignada(s). En su lugar, cámbiala a estado "Inhabilitada" o "Mantenimiento".`
      });
    }

    await item.destroy();

    try {
      await logActivity(req, {
        action: 'DELETE',
        tableAffected: 'Aula',
        recordId: req.params.id,
        newValue: `Eliminada aula ${item.code_classroom} - ${item.name_classroom}`
      });
    } catch (logErr) {
      console.error('AuditLog classroom delete error:', logErr);
    }

    await cacheService.invalidateTags(['classrooms', 'sections']);
    res.json({ message: 'Aula eliminada exitosamente' });
  } catch (err) {
    next(err);
  }
};

// 6. Obtener horario y matriz de ocupación de un aula en un período
exports.getSchedule = async (req, res, next) => {
  try {
    const classroom = await Classroom.findByPk(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Aula no encontrada' });
    }

    let id_period = req.query.id_period ? parseInt(req.query.id_period) : null;
    if (!id_period) {
      const active = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
      id_period = active ? active.id_period : null;
    }

    const where = {
      [Op.or]: [
        { classroom: classroom.name_classroom },
        { classroom: classroom.code_classroom }
      ]
    };
    if (id_period) {
      where.id_period = id_period;
    }

    const sections = await Section.findAll({
      where,
      include: [
        { model: Subject, attributes: ['id_subject', 'code_subject', 'name_subject', 'credit_units'] },
        { model: AcademicPeriod, attributes: ['id_period', 'name_period', 'period_status'] },
        { model: Teacher, include: [{ model: User, attributes: ['first_name', 'first_lastname'] }] }
      ],
      order: [['schedule_info', 'ASC']]
    });

    res.json({
      classroom,
      id_period,
      total_sections: sections.length,
      sections
    });
  } catch (err) {
    next(err);
  }
};

// 7. Verificar disponibilidad en tiempo real
exports.checkAvailability = async (req, res, next) => {
  try {
    const { id_period, schedule_day, schedule_start, schedule_end, classroom_name, exclude_section_id } = req.query;

    if (!id_period || !schedule_day || !schedule_start || !schedule_end || !classroom_name) {
      return res.status(400).json({ message: 'Faltan parámetros de consulta para verificar disponibilidad.' });
    }

    const formattedSchedule = `${schedule_day} ${schedule_start} - ${schedule_end}`;

    const where = {
      id_period: parseInt(id_period),
      classroom: classroom_name,
      schedule_info: formattedSchedule
    };

    if (exclude_section_id) {
      where.id_section = { [Op.ne]: parseInt(exclude_section_id) };
    }

    const conflict = await Section.findOne({
      where,
      include: [
        { model: Subject, attributes: ['name_subject'] },
        { model: Teacher, include: [{ model: User, attributes: ['first_name', 'first_lastname'] }] }
      ]
    });

    if (conflict) {
      const prof = conflict.Teacher?.User
        ? `${conflict.Teacher.User.first_name} ${conflict.Teacher.User.first_lastname}`
        : 'Docente no asignado';
      return res.json({
        available: false,
        message: `El aula "${classroom_name}" ya está ocupada el ${formattedSchedule} por la sección ${conflict.section_code} de ${conflict.Subject?.name_subject || 'otra asignatura'} (Profesor: ${prof}).`,
        conflict
      });
    }

    return res.json({
      available: true,
      message: `El aula "${classroom_name}" está disponible en el horario ${formattedSchedule}.`
    });
  } catch (err) {
    next(err);
  }
};
