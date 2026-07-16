const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pensumController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { pensumCreateSchema, pensumUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

// 1. Listar todos los pensums
router.get('/', cacheResponse(600, 'pensums'), ctrl.list);

// 2. Obtener un pensum por ID
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'pensums'), ctrl.get);

// 3. Crear pensum (POST)
router.post('/', validateZod({ body: pensumCreateSchema }), ctrl.create);

// 4. Actualizar pensum (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: pensumUpdateSchema }), ctrl.update);

// 5. Eliminar pensum
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;