/** Controlador REST de materias por pensum. */
const { PensumSubject } = require('../models');

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
    
    await item.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};