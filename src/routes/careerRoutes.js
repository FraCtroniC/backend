const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/careerController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [body('code_career').notEmpty(), body('name_career').notEmpty()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
