const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const studentController = require('../controllers/studentController');
const validate = require('../middlewares/validateRequest');

// 1. Listar todos los estudiantes
router.get('/', studentController.list);

// 2. Obtener un estudiante por ID
router.get('/:id', studentController.get);

// 3. Crear estudiante (POST)
router.post('/', 
    [
        body('id_user').isUUID().withMessage('El ID de usuario debe ser un UUID válido'),
        body('id_career').isInt().withMessage('La carrera debe ser un número entero'),
        body('current_semester').isInt({ min: 1, max: 12 }).withMessage('Semestre inválido'),
        body('status').notEmpty().withMessage('El estatus es obligatorio')
    ], 
    validate, 
    studentController.create
);

// 4. Actualizar estudiante (PUT) - AQUÍ ESTÁ LO QUE NECESITAS
router.put('/:id', 
    [
        body('id_career').optional().isInt().withMessage('La carrera debe ser un número entero'),
        body('current_semester').optional().isInt({ min: 1, max: 12 }).withMessage('Semestre inválido'),
        body('status').optional().notEmpty().withMessage('El estatus no puede estar vacío')
    ],
    validate,
    studentController.update
);

// 5. Eliminar estudiante
router.delete('/:id', studentController.remove);

module.exports = router;