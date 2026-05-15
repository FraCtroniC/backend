const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicPeriodController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { academicPeriodCreateSchema, academicPeriodUpdateSchema } = require('../validators/domainSchemas');

// 1. Listar todos los periodos académicos
router.get('/', ctrl.list);

// 2. Obtener un periodo específico por ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear periodo (POST)
router.post('/', validateZod({ body: academicPeriodCreateSchema }), ctrl.create);

// 4. Actualizar periodo (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: academicPeriodUpdateSchema }), ctrl.update);

// 5. Eliminar periodo
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;