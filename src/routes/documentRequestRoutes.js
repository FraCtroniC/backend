const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/documentRequestController');
const { validateZod } = require('../middlewares/validateZod');
const { uuidIdParam } = require('../validators/commonSchemas');
const { documentRequestCreateSchema, documentRequestUpdateSchema } = require('../validators/domainSchemas');

router.get('/', ctrl.list);
router.get('/:id', validateZod({ params: uuidIdParam }), ctrl.get);
router.post('/', validateZod({ body: documentRequestCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: uuidIdParam, body: documentRequestUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: uuidIdParam }), ctrl.remove);

module.exports = router;
