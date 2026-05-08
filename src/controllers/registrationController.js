const { Registration } = require('../models');

// 1. Listar todas las inscripciones
exports.list = async (req, res, next) => {
  try {
    const registrations = await Registration.findAll({ 
      order: [['registration_date', 'DESC']] 
    });
    res.json(registrations);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una inscripción por ID
exports.get = async (req, res, next) => {
  try {
    const registration = await Registration.findByPk(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    res.json(registration);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear inscripción (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_student, id_period, registration_date, status } = req.body;
    
    const newRegistration = await Registration.create({ 
      id_student, 
      id_period, 
      registration_date, 
      status 
    });
    
    res.status(201).json(newRegistration);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar estado o fecha (PUT)
exports.update = async (req, res, next) => {
  try {
    const registration = await Registration.findByPk(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }

    const { id_student, id_period, registration_date, status } = req.body;

    await registration.update({ 
      id_student, 
      id_period, 
      registration_date, 
      status 
    });

    res.json(registration);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar inscripción
exports.remove = async (req, res, next) => {
  try {
    const registration = await Registration.findByPk(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    await registration.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};