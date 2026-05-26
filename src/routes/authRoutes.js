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
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/domainSchemas');

router.post('/register', validateZod({ body: authRegisterSchema }), authController.register);
router.post('/login', validateZod({ body: authLoginSchema }), authController.login);
router.post(
  '/forgot-password',
  validateZod({ body: forgotPasswordSchema }),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  validateZod({ body: resetPasswordSchema }),
  authController.resetPassword
);
router.post('/token', validateZod({ body: tokenIssueSchema }), authController.issueToken);
router.get('/me', requireAuth, authController.me);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obtener el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil autenticado obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *             examples:
 *               success:
 *                 summary: Perfil autenticado
 *                 value:
 *                   id: 8baf8f0d-3c43-4d5d-9bc8-2bdc9f7b71d1
 *                   email: usuario@correo.com
 *                   name: Juan
 *                   lastname: Perez
 *                   role: Estudiante
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/profile', requireAuth, authController.profile);

/**
 * @openapi
 * /auth/profile_update:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Actualizar el perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdate'
 *           examples:
 *             updateNameEmail:
 *               summary: Actualizar nombre y correo
 *               value:
 *                 email: nuevo@correo.com
 *                 name: Juan
 *             updateLastname:
 *               summary: Actualizar apellido
 *               value:
 *                 lastname: Perez
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *             examples:
 *               success:
 *                 summary: Perfil actualizado
 *                 value:
 *                   id: 8baf8f0d-3c43-4d5d-9bc8-2bdc9f7b71d1
 *                   email: nuevo@correo.com
 *                   name: Juan
 *                   lastname: Perez
 *                   role: Estudiante
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/profile_update',
  requireAuth,
  validateZod({ body: profileUpdateSchema }),
  authController.profileUpdate
);
router.post(
  '/change-password',
  requireAuth,
  validateZod({ body: changePasswordSchema }),
  authController.changePassword
);

module.exports = router;
