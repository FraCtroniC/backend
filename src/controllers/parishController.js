const { Parish } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const where = req.query.id_municipality ? { id_municipality: Number(req.query.id_municipality) } : undefined;
    const items = await Parish.findAll({
      where,
      order: [['name_parish', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await Parish.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Parroquia no encontrada' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await Parish.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Parish.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Parroquia no encontrada' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Parish.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Parroquia no encontrada' });
    }

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};