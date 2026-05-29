const express = require('express');
const ctrl = require('../controllers/semesterController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { semesterCreateSchema, semesterUpdateSchema } = require('../validators/domainSchemas');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);
router.post('/', validateZod({ body: semesterCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: semesterUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;