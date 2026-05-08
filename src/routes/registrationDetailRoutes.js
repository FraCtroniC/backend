const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/registrationDetailController');
const validate = require('../middlewares/validateRequest');

// 1. Listar detalles
router.get('/', ctrl.list);

// 2. Obtener un detalle específico
router.get('/:id', ctrl.get);

// 3. Crear detalle de notas (POST)
router.post('/', 
    [
        body('id_registration').isInt().withMessage('ID de inscripción inválido'),
        body('id_section').isInt().withMessage('ID de sección inválido'),
        // Validamos que las notas sean decimales entre 0 y 20
        body(['corte_1', 'corte_2', 'corte_3', 'corte_4'])
            .optional({ checkFalsy: true })
            .isFloat({ min: 0, max: 20 })
            .withMessage('La nota debe ser un número entre 0 y 20'),
        body('attendance_percentage')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('El porcentaje de asistencia debe estar entre 0 y 100'),
        body('subject_status')
            .notEmpty()
            .withMessage('El estado de la materia es obligatorio')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar notas o estado (PUT)
router.put('/:id', 
    [
        body(['corte_1', 'corte_2', 'corte_3', 'corte_4', 'final_note'])
            .optional()
            .isFloat({ min: 0, max: 20 }),
        body('attendance_percentage').optional().isInt({ min: 0, max: 100 }),
        body('subject_status').optional().notEmpty()
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar detalle
router.delete('/:id', ctrl.remove);

module.exports = router;