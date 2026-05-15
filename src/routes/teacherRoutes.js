const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacherController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { teacherCreateSchema, teacherUpdateSchema } = require('../validators/domainSchemas');

router.get('/', ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);
router.post('/', validateZod({ body: teacherCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: teacherUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;
