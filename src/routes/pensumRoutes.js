const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/pensumController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [body('id_career').isInt(), body('name_pensum').notEmpty()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
