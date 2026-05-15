const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditLogController');
const { validateZod } = require('../middlewares/validateZod');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uuidIdParam } = require('../validators/commonSchemas');
const { auditLogCreateSchema } = require('../validators/domainSchemas');

// 1. Ver el historial completo de acciones
router.get('/', requireAuth, ctrl.list);

// 2. Consultar un registro específico
router.get('/:id', requireAuth, validateZod({ params: uuidIdParam }), ctrl.get);

// 3. Registrar una nueva acción en el log
router.post('/', requireAuth, validateZod({ body: auditLogCreateSchema }), ctrl.create);

module.exports = router;