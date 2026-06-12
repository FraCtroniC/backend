/** Controlador REST de secciones. */
const { Section, Career, Subject, Teacher, User, AcademicPeriod } = require('../models');

// Helper to include associations
const includeAssociations = [
  { model: Career },
  { model: Subject },
  { model: AcademicPeriod },
  { model: Teacher, include: [{ model: User }] }
];

// 1. Listar todas las secciones
exports.list = async (req, res, next) => {
  try {
    const sections = await Section.findAll({ 
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

    res.json(populated);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar sección (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Sección no encontrada' });
    }
    
    await section.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};