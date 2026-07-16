const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sectionController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { sectionCreateSchema, sectionUpdateSchema } = require('../validators/domainSchemas');
const { requireAuth } = require('../middlewares/authMiddleware');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

// Listar todas las secciones
router.get('/', cacheResponse(300, 'sections'), ctrl.list);

// Obtener una específica
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(300, 'sections'), ctrl.get);

// Crear sección (POST)
router.post('/', requireAuth, validateZod({ body: sectionCreateSchema }), ctrl.create);

// Actualizar sección (PUT)
router.put('/:id', requireAuth, validateZod({ params: numericIdParam, body: sectionUpdateSchema }), ctrl.update);

// Eliminar sección
router.delete('/:id', requireAuth, validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;