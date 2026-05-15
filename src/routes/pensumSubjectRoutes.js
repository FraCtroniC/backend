const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pensumSubjectController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { pensumSubjectCreateSchema, pensumSubjectUpdateSchema } = require('../validators/domainSchemas');

// 1. Listar todas las materias asignadas a pensums
router.get('/', ctrl.list);

// 2. Obtener una asignación específica por su ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// 3. Crear asignación (POST)
router.post('/', validateZod({ body: pensumSubjectCreateSchema }), ctrl.create);

// 4. Actualizar asignación (PUT)
router.put('/:id', validateZod({ params: numericIdParam, body: pensumSubjectUpdateSchema }), ctrl.update);

// 5. Eliminar materia del pensum
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;