const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/roleController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

router.post('/', 
    [
        body('name_role').notEmpty().trim().withMessage('El nombre del rol es obligatorio')
    ], 
    validate, 
    ctrl.create
);

router.put('/:id', 
    [
        body('name_role').optional().notEmpty().trim()
    ],
    validate, 
    ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;