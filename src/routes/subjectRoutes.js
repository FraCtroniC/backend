const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/subjectController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { subjectCreateSchema, subjectUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

router.get('/', cacheResponse(600, 'subjects'), ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'subjects'), ctrl.get);
router.post('/', validateZod({ body: subjectCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: subjectUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;
