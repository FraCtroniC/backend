const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/roleController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { roleCreateSchema, roleUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

router.get('/', cacheResponse(600, 'roles'), ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), cacheResponse(600, 'roles'), ctrl.get);

router.post('/', validateZod({ body: roleCreateSchema }), ctrl.create);

router.put('/:id', validateZod({ params: numericIdParam, body: roleUpdateSchema }), ctrl.update);

router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;