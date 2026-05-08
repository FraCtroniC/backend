const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/registrationController');
const validate = require('../middlewares/validateRequest');

// 1. Listar inscripciones
router.get('/', ctrl.list);

// 2. Obtener una inscripción por ID
router.get('/:id', ctrl.get);

// 3. Crear inscripción (POST)
router.post('/', 
    [
        body('id_student').isInt().withMessage('El ID del estudiante debe ser un número entero'),
        body('id_period').isInt().withMessage('El ID del periodo debe ser un número entero'),
        body('status').notEmpty().trim().withMessage('El estado de la inscripción es obligatorio')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar inscripción (PUT)
router.put('/:id', 
    [
        // Usamos .optional() para que puedas cambiar solo el status sin reenviar todo
        body('id_student').optional().isInt(),
        body('id_period').optional().isInt(),
        body('status').optional().notEmpty().trim()
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar inscripción
router.delete('/:id', ctrl.remove);

module.exports = router;