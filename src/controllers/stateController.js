const { State } = require('../models');
const cacheService = require('../services/cacheService');

exports.list = async (req, res, next) => {
  try {
    const items = await State.findAll({ order: [['name_state', 'ASC']] });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await State.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await State.create(req.body);
    await cacheService.invalidateTag('geo');
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await State.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }

    await item.update(req.body);
    await cacheService.invalidateTag('geo');
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await State.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }

    await item.destroy();
    await cacheService.invalidateTag('geo');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};