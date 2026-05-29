const express = require('express');
const ctrl = require('../controllers/preDocumentController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { preDocumentCreateSchema, preDocumentUpdateSchema } = require('../validators/domainSchemas');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);
router.post('/', validateZod({ body: preDocumentCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: preDocumentUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;