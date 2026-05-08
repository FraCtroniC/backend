const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/subjectPrerequisiteController');
const validate = require('../middlewares/validateRequest');

// Listar todas las prelaciones
router.get('/', ctrl.list);

// Obtener una específica por ID
router.get('/:id', ctrl.get);

// Crear una prelación (Asegúrate de que estos nombres coincidan con tu base de datos)
router.post('/', 
    [
        body('id_subject').isInt().withMessage('El ID de la materia debe ser un número entero'), 
        body('id_prerequisite_subject').isInt().withMessage('El ID de la materia prelante debe ser un número entero')
    ], 
    validate, 
    ctrl.create
);

// Actualizar una prelación
router.put('/:id', ctrl.update);

// Eliminar una prelación
router.delete('/:id', ctrl.remove);

module.exports = router;