const express = require('express');
const ctrl = require('../controllers/parishController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { parishCreateSchema, parishUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

const router = express.Router();

router.get('/', cacheResponse(600, 'geo'), ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'geo'), ctrl.get);
router.post('/', validateZod({ body: parishCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: parishUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;