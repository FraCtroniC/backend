const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registrationDetailController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { registrationDetailCreateSchema, registrationDetailUpdateSchema } = require('../validators/domainSchemas');

// 1. Listar detalles
router.get('/', ctrl.list);

// 2. Obtener un detalle específico
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear detalle de notas (POST)
router.post('/', validateZod({ body: registrationDetailCreateSchema }), ctrl.create);

// 4. Actualizar notas o estado (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: registrationDetailUpdateSchema }), ctrl.update);

// 5. Eliminar detalle
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;