const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/registrationController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [body('id_student').isInt(), body('id_period').isInt()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
