const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registrationDetailController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { registrationDetailCreateSchema, registrationDetailUpdateSchema } = require('../validators/domainSchemas');
const { requireAuth } = require('../middlewares/authMiddleware');

// 1. Listar detalles
router.get('/', ctrl.list);

// 2. Obtener un detalle específico
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear detalle de notas (POST)
router.post('/', requireAuth, validateZod({ body: registrationDetailCreateSchema }), ctrl.create);

// 4. Actualizar notas o estado (PUT)
router.put('/:id', requireAuth, validateZod({ params: numericIdParam, body: registrationDetailUpdateSchema }), ctrl.update);

// 5. Eliminar detalle
router.delete('/:id', requireAuth, validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;