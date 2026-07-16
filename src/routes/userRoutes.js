const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateZod } = require('../middlewares/validateZod');
const { uuidIdParam } = require('../validators/commonSchemas');
const { userCreateSchema, userUpdateSchema } = require('../validators/domainSchemas');
const { cacheResponse } = require('../middlewares/cacheMiddleware');

router.get('/', cacheResponse(300, 'users'), userController.list);

router.post(
  '/',
  validateZod({ body: userCreateSchema }),
  userController.create
);

router.get('/:id', validateZod({ params: uuidIdParam }), cacheResponse(300, 'users'), userController.get);
router.put('/:id', validateZod({ params: uuidIdParam, body: userUpdateSchema }), userController.update);
router.delete('/:id', validateZod({ params: uuidIdParam }), userController.remove);


module.exports = router;
