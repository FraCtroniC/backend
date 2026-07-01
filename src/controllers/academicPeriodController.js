const { AcademicPeriod, AuditLog, Section, Registration } = require('../models');
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

// 2. Obtener el período activo
exports.getActive = async (req, res, next) => {
  try {
    const activePeriod = await AcademicPeriod.findOne({
      where: { period_status: 'Activo' }
    });
    if (!activePeriod) {
      return res.status(404).json({ message: 'No hay un período académico activo' });
    }
    return res.json(activePeriod);
  } catch (err) {
    next(err);
  }
};

// 3. Obtener un periodo específico
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
    
    // Validar si ya hay un período activo
    if (period_status === 'Activo') {
      const activePeriod = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
      if (activePeriod) {
        return res.status(400).json({ message: `Ya existe un período activo (${activePeriod.name_period}). Debe culminarlo antes de iniciar otro.` });
      }
    }

    // Forzar cierre de inscripción si está culminado
    const finalEnrollmentStatus = period_status === 'Culminado' ? 'Cerrada' : enrollment_status;

    const item = await AcademicPeriod.create({
      name_period,
      start_date,
      end_date,
      enrollment_status: finalEnrollmentStatus,
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
    const { period_status, enrollment_status } = req.body;

    // Validar si ya hay un período activo distinto a este
    if (period_status === 'Activo' && item.period_status !== 'Activo') {
      const activePeriod = await AcademicPeriod.findOne({ where: { period_status: 'Activo' } });
      if (activePeriod && activePeriod.id_period !== item.id_period) {
        return res.status(400).json({ message: `Ya existe un período activo (${activePeriod.name_period}). Debe culminarlo antes de activar este.` });
      }
    }

    const finalEnrollmentStatus = period_status === 'Culminado' ? 'Cerrada' : (enrollment_status || item.enrollment_status);

    const oldName = item.name_period;
    const oldStatus = item.period_status;
    await item.update({ ...req.body, enrollment_status: finalEnrollmentStatus });

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
    
    // Verificar si hay registros dependientes
    const sectionsCount = await Section.count({ where: { id_period: item.id_period } });
    const registrationsCount = await Registration.count({ where: { id_period: item.id_period } });
    
    if (sectionsCount > 0 || registrationsCount > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar el período porque tiene ${sectionsCount} secciones y ${registrationsCount} inscripciones asociadas. Debe culminarlo en lugar de eliminarlo.` 
      });
    }

    await item.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Período Académico',
      recordId: item.id_period,
      newValue: `Período académico eliminado: ${item.name_period}`
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};