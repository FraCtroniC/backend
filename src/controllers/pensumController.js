/** Controlador REST de pensums. */
const { Pensum } = require('../models');

// 1. Listar todos los pensum
exports.list = async (req, res, next) => {
  try {
    const items = await Pensum.findAll({ 
      order: [['id_pensum', 'ASC']] 
    });
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener un pensum por ID
exports.get = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear nuevo pensum (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_career, name_pensum, resolution_date, is_active } = req.body;
    
    const newItem = await Pensum.create({ 
      id_career, 
      name_pensum, 
      resolution_date, 
      is_active 
    });
    
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar pensum (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }

    const { id_career, name_pensum, resolution_date, is_active } = req.body;

    await item.update({ 
      id_career, 
      name_pensum, 
      resolution_date, 
      is_active 
    });

    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar pensum
exports.remove = async (req, res, next) => {
  try {
    const item = await Pensum.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Pensum no encontrado' });
    }
    
    await item.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};