const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/auditLogController');
const validate = require('../middlewares/validateRequest');

// 1. Ver el historial completo de acciones
router.get('/', ctrl.list);

// 2. Consultar un registro específico
router.get('/:id', ctrl.get);

// 3. Registrar una nueva acción en el log
router.post('/', 
    [
        body('id_user').isInt().withMessage('El ID de usuario debe ser un número'),
        body('action').notEmpty().trim().withMessage('La acción (INSERT/UPDATE/DELETE) es obligatoria'),
        body('table_affected').notEmpty().trim().withMessage('Debe indicar qué tabla se modificó'),
        body('record_id').notEmpty().withMessage('Debe indicar el ID del registro afectado')
    ], 
    validate, 
    ctrl.create
);

module.exports = router;