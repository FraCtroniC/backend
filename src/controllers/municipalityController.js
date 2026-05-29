const { Municipality } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const where = req.query.id_state ? { id_state: Number(req.query.id_state) } : undefined;
    const items = await Municipality.findAll({
      where,
      order: [['name_municipality', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Municipality.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Municipio no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Municipality.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Municipality.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Municipio no encontrado' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Municipality.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Municipio no encontrado' });
    }

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};