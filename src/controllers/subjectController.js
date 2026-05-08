const { Subject } = require('../models');

// 1. Listar todas las materias
exports.list = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({ order: [['name_subject', 'ASC']] });
    res.json(subjects);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una materia por ID
exports.get = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    res.json(subject);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear materia (POST)
exports.create = async (req, res, next) => {
  try {
    // Aquí usamos tus campos exactos
    const { code_subject, name_subject, credit_units } = req.body;
    
    const newSubject = await Subject.create({ 
      code_subject, 
      name_subject, 
      credit_units 
    });
    
    res.status(201).json(newSubject);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar materia (PUT)
exports.update = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    // Extraemos los campos para la actualización
    const { code_subject, name_subject, credit_units } = req.body;

    await subject.update({ 
      code_subject, 
      name_subject, 
      credit_units 
    });

    res.json(subject);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar materia (DELETE)
exports.remove = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }
    
    await subject.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};