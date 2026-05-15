const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subjectPrerequisiteController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { subjectPrerequisiteCreateSchema, subjectPrerequisiteUpdateSchema } = require('../validators/domainSchemas');

// Listar todas las prelaciones
router.get('/', ctrl.list);

// Obtener una específica por ID
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);

// Crear una prelación (Asegúrate de que estos nombres coincidan con tu base de datos)
router.post('/', validateZod({ body: subjectPrerequisiteCreateSchema }), ctrl.create);

// Actualizar una prelación
router.put('/:id', validateZod({ params: numericIdParam, body: subjectPrerequisiteUpdateSchema }), ctrl.update);

// Eliminar una prelación
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;