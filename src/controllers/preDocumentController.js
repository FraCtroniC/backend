const { PreDocument } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const where = req.query.id_pre ? { id_pre: Number(req.query.id_pre) } : undefined;
    const items = await PreDocument.findAll({
      where,
      order: [['upload_date', 'DESC']],
      limit: 200,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await PreDocument.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await PreDocument.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    await item.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};