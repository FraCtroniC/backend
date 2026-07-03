/** Controlador REST de inscripciones. */
const { Registration } = require('../models');
const { logActivity } = require('../utils/auditLogger');
const NotificationService = require('../services/notificationService');
const { checkRegistrationPeriodLocked } = require('../utils/periodLock');

// 1. Listar inscripciones con paginación y relaciones
exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.id_period) {
      where.id_period = parseInt(req.query.id_period);
    }

    const { count, rows } = await Registration.findAndCountAll({ 
      where,
      limit,
      offset,
      order: [['registration_date', 'DESC']],
      include: [
        {
          model: require('../models').Student,
          include: [
            { model: require('../models').User, attributes: ['id_user', 'first_name', 'first_lastname', 'document_id'] },
            { model: require('../models').Career, attributes: ['id_career', 'name_career'] }
          ]
        },
        { model: require('../models').AcademicPeriod, attributes: ['id_period', 'name_period'] },
        {
          model: require('../models').RegistrationDetail,
          include: [
            {
              model: require('../models').Section,
              include: [
                { model: require('../models').Subject, attributes: ['id_subject', 'name_subject', 'credit_units'] }
              ]
            }
          ]
        }
      ]
    });

    res.json({
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      }
    });
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
    const { id_student, id_period, status } = req.body;
    
    const newRegistration = await Registration.create({ 
      id_student, 
      id_period, 
      status 
    });
    
    await logActivity(req, {
      action: 'CREATE',
      tableAffected: 'Inscripción',
      recordId: newRegistration.id_registration,
      newValue: `Inscripción creada (estudiante: ${id_student}, período: ${id_period}, status: ${status})`
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

    const periodCheck = await checkRegistrationPeriodLocked(registration.id_registration);
    if (periodCheck.locked) {
      return res.status(400).json({ message: periodCheck.message });
    }

    const { id_student, id_period, registration_date, status } = req.body;

    await registration.update({ 
      id_student, 
      id_period, 
      registration_date, 
      status 
    });

    await logActivity(req, {
      action: 'UPDATE',
      tableAffected: 'Inscripción',
      recordId: registration.id_registration,
      newValue: `Inscripción actualizada (id: ${registration.id_registration}, status: ${status})`
    });

    if (status && status !== registration.status) {
      await NotificationService.notifyStudent(
        id_student || registration.id_student,
        'Estado de Inscripción',
        `Tu solicitud de inscripción ha cambiado al estado: ${status}`,
        status === 'Aprobada' ? 'success' : 'info'
      );
    }

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

    const periodCheck = await checkRegistrationPeriodLocked(registration.id_registration);
    if (periodCheck.locked) {
      return res.status(400).json({ message: periodCheck.message });
    }
    
    await registration.destroy();

    await logActivity(req, {
      action: 'DELETE',
      tableAffected: 'Inscripción',
      recordId: registration.id_registration,
      newValue: `Inscripción eliminada (id: ${registration.id_registration})`
    });

    res.status(204).end();
  } catch (err) { 
    next(err); 
  }
};