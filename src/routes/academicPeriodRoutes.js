const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicPeriodController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { academicPeriodCreateSchema, academicPeriodUpdateSchema } = require('../validators/domainSchemas');
const { requireAuth } = require('../middlewares/authMiddleware');

// 1. Listar todos los periodos académicos
router.get('/', ctrl.list);

// 2. Obtener el período activo
router.get('/active', ctrl.getActive);

// 3. Obtener un periodo específico por ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear periodo (POST)
router.post('/', requireAuth, validateZod({ body: academicPeriodCreateSchema }), ctrl.create);

// 4. Actualizar periodo (PUT)
router.put('/:id', requireAuth, validateZod({ params: numericIdParam, body: academicPeriodUpdateSchema }), ctrl.update);

// 5. Eliminar periodo
router.delete('/:id', requireAuth, validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;