/** Controlador REST de registros de auditoria. */
const { AuditLog } = require('../models');

// 1. Listar todos los logs (Historial de cambios)
exports.list = async (req, res, next) => {
  try {
    const items = await AuditLog.findAll({
      // Ordenamos para ver lo más reciente primero
      order: [['created_at', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// 2. Obtener un log específico por ID
exports.get = async (req, res, next) => {
  try {
    const item = await AuditLog.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Registro de auditoría no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 3. Crear un log (POST)
// Nota: Normalmente esto se hace automáticamente desde otros controladores,
// pero aquí lo tienes para pruebas manuales.
exports.create = async (req, res, next) => {
  try {
    const { 
      id_user, 
      action, 
      table_affected, 
      record_id, 
      old_value, 
      new_value 
    } = req.body;
    
    const newItem = await AuditLog.create({ 
      id_user, 
      action, 
      table_affected, 
      record_id, 
      old_value, 
      new_value 
    });
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
};