const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sectionController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { sectionCreateSchema, sectionUpdateSchema } = require('../validators/domainSchemas');

// Listar todas las secciones
router.get('/', ctrl.list);

// Obtener una específica
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// Crear sección (POST)
router.post('/', validateZod({ body: sectionCreateSchema }), ctrl.create);

// Actualizar sección (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: sectionUpdateSchema }), ctrl.update);

// Eliminar sección
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;