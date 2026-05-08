const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/sectionController');
const validate = require('../middlewares/validateRequest');

// Listar todas las secciones
router.get('/', ctrl.list);

// Obtener una específica
router.get('/:id', ctrl.get);

// Crear sección (POST)
router.post('/', 
    [
        body('id_subject').isInt().withMessage('El ID de materia debe ser un número'),
        body('id_period').isInt().withMessage('El ID de periodo debe ser un número'),
        body('id_teacher').isInt().withMessage('El ID de profesor debe ser un número'),
        body('section_code').notEmpty().trim().withMessage('El código de sección (ej: C1) es obligatorio'),
        body('quota_max').isInt({ min: 1 }).withMessage('El cupo debe ser un número mayor a 0'),
        body('classroom').notEmpty().withMessage('El salón o laboratorio es obligatorio')
    ], 
    validate, 
    ctrl.create
);

// Actualizar sección (PUT)
router.put('/:id', 
    [
        body('section_code').optional().notEmpty().trim(),
        body('quota_max').optional().isInt({ min: 1 }),
        body('id_teacher').optional().isInt()
    ],
    validate, 
    ctrl.update
);

// Eliminar sección
router.delete('/:id', ctrl.remove);

module.exports = router;