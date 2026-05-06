const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/academicPeriodController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [body('name_period').notEmpty(), body('start_date').notEmpty(), body('end_date').notEmpty()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
