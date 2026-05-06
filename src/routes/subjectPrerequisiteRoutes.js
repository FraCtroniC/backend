const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/subjectPrerequisiteController');
const validate = require('../middlewares/validateRequest');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', [body('id_pensum_subject').isInt(), body('id_required_pensum_subject').isInt()], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
