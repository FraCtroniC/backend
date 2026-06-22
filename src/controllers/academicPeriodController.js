const { AcademicPeriod, AuditLog } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const NotificationService = require('../services/notificationService');

// 1. Listar todos los periodos (ordenados por fecha de inicio)
exports.list = async (req, res, next) => {
  try {
    const items = await AcademicPeriod.findAll({
      order: [['start_date', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// 2. Obtener un periodo específico
exports.get = async (req, res, next) => {
  try {
    const item = await AcademicPeriod.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Periodo académico no encontrado' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 3. Crear periodo (Ej: "2026-I")
exports.create = async (req, res, next) => {
  try {
    const { name_period, start_date, end_date, enrollment_status, period_status } = req.body;
    const item = await AcademicPeriod.create({
      name_period,
      start_date,
      end_date,
      enrollment_status,
      period_status
    });
    
    // Log creation in audit logs
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Período Académico',
      recordId: item.id_period,
      newValue: `Creado el período académico ${name_period}`
    });

    if (item.period_status === 'Activo') {
      await NotificationService.notifyAllUsers('Nuevo Período Académico', `¡El período académico ${item.name_period} ahora está Activo!`, 'success');
    }

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// 4. Actualizar fechas o estados
exports.update = async (req, res, next) => {
  try {
    const item = await AcademicPeriod.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Periodo no encontrado' });
    
    const oldName = item.name_period;
    const oldStatus = item.period_status;
    await item.update(req.body);

    // Log update in audit logs
    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Período Académico',
      recordId: item.id_period,
      newValue: `Modificado el período académico ${oldName}. Estatus: ${item.period_status}, Inscripción: ${item.enrollment_status}`
    });

    if (item.period_status === 'Activo' && oldStatus !== 'Activo') {
      await NotificationService.notifyAllUsers('Nuevo Período Académico', `¡El período académico ${item.name_period} ahora está Activo!`, 'success');
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

// 5. Eliminar periodo
exports.remove = async (req, res, next) => {
  try {
    const item = await AcademicPeriod.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Periodo no encontrado' });
    
    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};