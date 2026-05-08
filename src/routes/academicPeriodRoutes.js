const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/academicPeriodController');
const validate = require('../middlewares/validateRequest');

// 1. Listar todos los periodos académicos
router.get('/', ctrl.list);

// 2. Obtener un periodo específico por ID
router.get('/:id', ctrl.get);

// 3. Crear periodo (POST)
router.post('/', 
    [
        body('name_period').notEmpty().trim().withMessage('El nombre del periodo es obligatorio'),
        body('start_date').isDate().withMessage('La fecha de inicio debe ser válida (YYYY-MM-DD)'),
        body('end_date').isDate().withMessage('La fecha de fin debe ser válida (YYYY-MM-DD)'),
        body('enrollment_status').notEmpty().withMessage('El estado de inscripción es obligatorio')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar periodo (PUT)
router.put('/:id', 
    [
        body('name_period').optional().notEmpty(),
        body('start_date').optional().isDate(),
        body('end_date').optional().isDate(),
        body('enrollment_status').optional().notEmpty(),
        body('period_status').optional().notEmpty()
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar periodo
router.delete('/:id', ctrl.remove);

module.exports = router;