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

module.exports = router;
