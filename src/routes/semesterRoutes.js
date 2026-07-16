const express = require('express');
const ctrl = require('../controllers/semesterController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { semesterCreateSchema, semesterUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

const router = express.Router();

router.get('/', cacheResponse(600, 'semesters'), ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'semesters'), ctrl.get);
router.post('/', validateZod({ body: semesterCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: semesterUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;