/** Controlador REST de solicitudes de documentos. */
const { DocumentRequest } = require('../models');

// 1. Listar todas las solicitudes de documentos
exports.list = async (req, res, next) => {
  try {
    const items = await DocumentRequest.findAll({ 
      order: [['request_date', 'DESC']] 
    });
    res.json(items);
  } catch (err) { 
    next(err); 
  }
};

// 2. Obtener una solicitud por ID
exports.get = async (req, res, next) => {
  try {
    const item = await DocumentRequest.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 3. Crear nueva solicitud (POST)
exports.create = async (req, res, next) => {
  try {
    const { id_student, document_type, request_date, status, hash_verification } = req.body;
    
    const newItem = await DocumentRequest.create({ 
      id_student, 
      document_type, 
      request_date, 
      status, 
      hash_verification 
    });
    
    res.status(201).json(newItem);
  } catch (err) { 
    next(err); 
  }
};

// 4. Actualizar estado o hash (PUT)
exports.update = async (req, res, next) => {
  try {
    const item = await DocumentRequest.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    const { id_student, document_type, request_date, status, hash_verification } = req.body;

    await item.update({ 
      id_student, 
      document_type, 
      request_date, 
      status, 
      hash_verification 
    });

    res.json(item);
  } catch (err) { 
    next(err); 
  }
};

// 5. Eliminar solicitud
exports.remove = async (req, res, next) => {
  try {
    const item = await DocumentRequest.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    
    await item.destroy();
    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};