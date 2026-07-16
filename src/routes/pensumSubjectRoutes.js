const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pensumSubjectController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { pensumSubjectCreateSchema, pensumSubjectUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

// 1. Listar todas las materias asignadas a pensums
router.get('/', cacheResponse(600, 'pensums', 'subjects'), ctrl.list);

// 2. Obtener una asignación específica por su ID
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'pensums', 'subjects'), ctrl.get);

// 3. Crear asignación (POST)
router.post('/', validateZod({ body: pensumSubjectCreateSchema }), ctrl.create);

// 4. Actualizar asignación (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: pensumSubjectUpdateSchema }), ctrl.update);

// 5. Eliminar materia del pensum
router.delete('/:id', requireAuth, validateZod({ params: numericIdParam }), ctrl.remove);

// 6. Eliminar materia del pensum y la materia global (POST para evitar problemas con body en DELETE)
router.post('/:id/full-delete', requireAuth, validateZod({ params: numericIdParam }), ctrl.fullRemove);

module.exports = router;