const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/registrationController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { registrationCreateSchema, registrationUpdateSchema } = require('../validators/domainSchemas');

// 1. Listar inscripciones
router.get('/', ctrl.list);

// 2. Obtener una inscripción por ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear inscripción (POST)
router.post('/', validateZod({ body: registrationCreateSchema }), ctrl.create);

// 4. Actualizar inscripción (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: registrationUpdateSchema }), ctrl.update);

// 5. Eliminar inscripción
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;