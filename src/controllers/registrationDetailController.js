const { RegistrationDetail } = require('../models');

// 1. Listar todos los detalles de inscripción (Notas)
exports.list = async (req, res, next) => {
  try {
    const items = await RegistrationDetail.findAll();
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener nota por ID de detalle
exports.get = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Cargar notas nuevas (POST)
exports.create = async (req, res, next) => {
  try {
    const { 
      id_registration, 
      id_section, 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status 
    } = req.body;
    
    const newItem = await RegistrationDetail.create({ 
      id_registration, 
      id_section, 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status 
    });
    
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar notas o asistencia (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }

    const { 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status 
    } = req.body;

    await item.update({ 
      corte_1, 
      corte_2, 
      corte_3, 
      corte_4, 
      recuperatorio, 
      final_note, 
      attendance_percentage, 
      subject_status 
    });

    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar detalle
exports.remove = async (req, res, next) => {
  try {
    const item = await RegistrationDetail.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }
    
    await item.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};