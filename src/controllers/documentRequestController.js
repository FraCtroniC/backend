/** Controlador REST de solicitudes de documentos. */
const { DocumentRequest } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const NotificationService = require('../services/notificationService');

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
    
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Solicitud Documento',
      recordId: newItem.id_request,
      newValue: `Solicitud de documento creada: ${document_type} (estudiante: ${id_student})`
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

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Solicitud Documento',
      recordId: item.id_request,
      newValue: `Solicitud de documento actualizada: ${item.document_type} - status: ${status}`
    });

    if (status && status !== item.status) {
      await NotificationService.notifyStudent(
        id_student || item.id_student,
        'Solicitud de Documento',
        `Tu solicitud de ${document_type || item.document_type} ha cambiado a estado: ${status}`,
        status === 'Procesado' ? 'success' : 'info'
      );
    }

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

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Solicitud Documento',
      recordId: item.id_request,
      newValue: `Solicitud de documento eliminada: ${item.document_type}`
    });

    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};