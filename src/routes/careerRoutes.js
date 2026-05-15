const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/careerController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { careerCreateSchema, careerUpdateSchema } = require('../validators/domainSchemas');

// 1. Listar todas las carreras
router.get('/', ctrl.list);

// 2. Obtener carrera por ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear carrera (POST)
router.post('/', validateZod({ body: careerCreateSchema }), ctrl.create);

// 4. Actualizar carrera (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: careerUpdateSchema }), ctrl.update);

// 5. Eliminar carrera
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;