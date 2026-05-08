const { Career } = require('../models');

// 1. Listar todas las carreras
exports.list = async (req, res, next) => {
  try {
    const items = await Career.findAll({
      order: [['name_career', 'ASC']]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// 2. Obtener una carrera por ID
exports.get = async (req, res, next) => {
  try {
    const item = await Career.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 3. Crear nueva carrera (POST)
exports.create = async (req, res, next) => {
  try {
    const { code_career, name_career, total_semesters, is_active } = req.body;
    
    const newItem = await Career.create({ 
      code_career, 
      name_career, 
      total_semesters, 
      is_active 
    });
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};

// 4. Actualizar carrera (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await Career.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    const { code_career, name_career, total_semesters, is_active } = req.body;

    await item.update({ 
      code_career, 
      name_career, 
      total_semesters, 
      is_active 
    });

    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 5. Eliminar carrera
exports.remove = async (req, res, next) => {
  try {
    const item = await Career.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }
    
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};