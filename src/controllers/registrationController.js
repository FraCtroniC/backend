const { Registration } = require('../models');

exports.list = async (req, res, next) => { try { const items = await Registration.findAll(); res.json(items); } catch (err) { next(err); } };
exports.get = async (req, res, next) => { try { const item = await Registration.findByPk(req.params.id); if (!item) return res.status(404).json({ message: 'Not found' }); res.json(item); } catch (err) { next(err); } };
exports.create = async (req, res, next) => { try { const item = await Registration.create(req.body); res.status(201).json(item); } catch (err) { next(err); } };
exports.update = async (req, res, next) => { try { const item = await Registration.findByPk(req.params.id); if (!item) return res.status(404).json({ message: 'Not found' }); await item.update(req.body); res.json(item); } catch (err) { next(err); } };
exports.remove = async (req, res, next) => { try { const item = await Registration.findByPk(req.params.id); if (!item) return res.status(404).json({ message: 'Not found' }); await item.destroy(); res.status(204).end(); } catch (err) { next(err); } };
