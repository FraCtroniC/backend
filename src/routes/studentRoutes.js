const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { studentCreateSchema, studentUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

// 1. Listar todos los estudiantes
router.get('/', cacheResponse(300, 'students'), studentController.list);

// 2. Obtener un estudiante por ID
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(300, 'students'), studentController.get);

// 3. Crear estudiante (POST)
router.post('/', validateZod({ body: studentCreateSchema }), studentController.create);

// 4. Actualizar estudiante (PUT) - AQUÍ ESTÁ LO QUE NECESITAS
router.put('/:id', validateZod({ params: numericIdParam, body: studentUpdateSchema }), studentController.update);

// 5. Eliminar estudiante
router.delete('/:id', validateZod({ params: numericIdParam }), studentController.remove);

module.exports = router;