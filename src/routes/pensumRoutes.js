const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/pensumController');
const validate = require('../middlewares/validateRequest');

// 1. Listar todos los pensums
router.get('/', ctrl.list);

// 2. Obtener un pensum por ID
router.get('/:id', ctrl.get);

// 3. Crear pensum (POST)
router.post('/', 
    [
        body('id_career').isInt().withMessage('El ID de la carrera debe ser un número entero'),
        body('name_pensum').notEmpty().trim().withMessage('El nombre del pensum es obligatorio'),
        body('is_active').isBoolean().withMessage('El campo is_active debe ser true o false')
    ], 
    validate, 
    ctrl.create
);

// 4. Actualizar pensum (PUT)
router.put('/:id', 
    [
        body('id_career').optional().isInt(),
        body('name_pensum').optional().notEmpty().trim(),
        body('is_active').optional().isBoolean()
    ],
    validate, 
    ctrl.update
);

// 5. Eliminar pensum
router.delete('/:id', ctrl.remove);

module.exports = router;