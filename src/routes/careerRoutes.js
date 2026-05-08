const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/careerController');
const validate = require('../middlewares/validateRequest');

// 1. Listar todas las carreras
router.get('/', ctrl.list);

// 2. Obtener carrera por ID
router.get('/:id', ctrl.get);

// 3. Crear carrera (POST)
router.post('/', 
    [
        body('code_career').notEmpty().trim().withMessage('El código de la carrera es obligatorio'),
        body('name_career').notEmpty().trim().withMessage('El nombre de la carrera es obligatorio'),
        body('total_semesters').isInt({ min: 1 }).withMessage('Debe indicar el total de semestres')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar carrera (PUT)
router.put('/:id', 
    [
        body('code_career').optional().notEmpty().trim(),
        body('name_career').optional().notEmpty().trim(),
        body('total_semesters').optional().isInt({ min: 1 }),
        body('is_active').optional().isBoolean()
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar carrera
router.delete('/:id', ctrl.remove);

module.exports = router;