const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const { validateZod } = require('../middlewares/validateZod');
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  tokenIssueSchema,
  authRegisterSchema,
  authLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} = require('../validators/domainSchemas');

router.post('/register', validateZod({ body: authRegisterSchema }), authController.register);
router.post('/login', validateZod({ body: authLoginSchema }), authController.login);
router.post(
  '/forgot-password',
  validateZod({ body: forgotPasswordSchema }),
  authController.forgotPassword
);
router.post('/token', validateZod({ body: tokenIssueSchema }), authController.issueToken);
router.get('/me', requireAuth, authController.me);
router.post(
  '/change-password',
  requireAuth,
  validateZod({ body: changePasswordSchema }),
  authController.changePassword
);

module.exports = router;
