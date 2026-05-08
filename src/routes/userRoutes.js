const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const validateRequest = require('../middlewares/validateRequest');

router.get('/', userController.list);

router.post(
  '/',
  [body('username').isLength({ min: 3 }), body('name').notEmpty()],
  validateRequest,
  userController.create
);

router.get('/:id', userController.get);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);


module.exports = router;
