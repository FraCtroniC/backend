const express = require('express');
const ctrl = require('../controllers/preRegistrationController');
const { validateZod } = require('../middlewares/validateZod');
const { numericIdParam } = require('../validators/commonSchemas');
const { preRegistrationCreateSchema, preRegistrationUpdateSchema } = require('../validators/domainSchemas');

const router = express.Router();

router.get('/', ctrl.list);
router.get('/:id', validateZod({ params: numericIdParam }), ctrl.get);
router.post('/', validateZod({ body: preRegistrationCreateSchema }), ctrl.create);
router.put('/:id', validateZod({ params: numericIdParam, body: preRegistrationUpdateSchema }), ctrl.update);
router.delete('/:id', validateZod({ params: numericIdParam }), ctrl.remove);

module.exports = router;