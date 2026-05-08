const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/pensumSubjectController');
const validate = require('../middlewares/validateRequest');

// 1. Listar todas las materias asignadas a pensums
router.get('/', ctrl.list);

// 2. Obtener una asignación específica por su ID
router.get('/:id', ctrl.get);

// 3. Crear asignación (POST)
router.post('/', 
    [
        body('id_pensum').isInt().withMessage('El ID del pensum debe ser un número entero'),
        body('id_subject').isInt().withMessage('El ID de la materia debe ser un número entero'),
        body('semester').isInt({ min: 1, max: 12 }).withMessage('El semestre debe ser un número entre 1 y 12')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar asignación (PUT)
router.put('/:id', 
    [
        // Usamos .optional() para que puedas actualizar solo el semestre si es necesario
        body('id_pensum').optional().isInt(),
        body('id_subject').optional().isInt(),
        body('semester').optional().isInt({ min: 1, max: 12 })
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar materia del pensum
router.delete('/:id', ctrl.remove);

module.exports = router;