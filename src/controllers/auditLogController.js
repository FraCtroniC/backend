const { AuditLog } = require('../models');

exports.list = async (req, res, next) => { try { const items = await AuditLog.findAll(); res.json(items); } catch (err) { next(err); } };
exports.get = async (req, res, next) => { try { const item = await AuditLog.findByPk(req.params.id); if (!item) return res.status(404).json({ message: 'Not found' }); res.json(item); } catch (err) { next(err); } };
// Audit logs are usually not created via public endpoints; create allowed for completeness
exports.create = async (req, res, next) => { try { const item = await AuditLog.create(req.body); res.status(201).json(item); } catch (err) { next(err); } };
