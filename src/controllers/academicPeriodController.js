/** Controlador REST de periodos academicos. */
const { AcademicPeriod } = require('../models');

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
    
    await item.update(req.body);
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