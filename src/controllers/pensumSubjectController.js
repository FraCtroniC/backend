/** Controlador REST de materias por pensum. */
const { PensumSubject, SubjectPrerequisite } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const { Op } = require('sequelize');

// 1. Listar todas las materias de los pensum
exports.list = async (req, res, next) => {
  try {
    // Los ordenamos por semestre para que el pensum se vea organizado
    const items = await PensumSubject.findAll({ 
      order: [['id_semester', 'ASC'], ['id_pensum', 'ASC']] 
    });
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una relación específica por ID
exports.get = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación Pensum-Materia no encontrada' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Asignar materia a un pensum (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_pensum, id_subject, id_semester, code_subject } = req.body;
    
    const newItem = await PensumSubject.create({ 
      id_pensum, 
      id_subject, 
      id_semester,
      code_subject,
    });
    
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Pensum-Materia',
      recordId: newItem.id_pensum_subject,
      newValue: `Materia asignada al pensum (id_pensum: ${id_pensum}, code: ${code_subject})`
    });
    
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar semestre o materia (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    const { id_pensum, id_subject, id_semester, code_subject } = req.body;

    await item.update({ 
      id_pensum, 
      id_subject, 
      id_semester,
      code_subject,
    });

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Pensum-Materia',
      recordId: item.id_pensum_subject,
      newValue: `Relación pensum-materia actualizada (id_pensum: ${id_pensum}, code: ${code_subject})`
    });

    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar materia del pensum (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const item = await PensumSubject.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }
    
    // Eliminar las prelaciones asociadas para evitar conflictos de clave foránea
    await SubjectPrerequisite.destroy({
      where: {
        [Op.or]: [
          { id_pensum_subject: item.id_pensum_subject },
          { id_required_pensum_subject: item.id_pensum_subject }
        ]
      }
    });

    await item.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Pensum-Materia',
      recordId: item.id_pensum_subject,
      newValue: `Materia eliminada del pensum (code: ${item.code_subject})`
    });

    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};